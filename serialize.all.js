// Node.js API.
const assert = require('assert')
const util = require('util')

// Determine if an integer serialization should be unrolled.
const { serialize: homogeneous } = require('./homogeneous')

const map = require('./map')

// Convert numbers and arrays to numbers to literals with hex literals.
const hex = require('./hex')

// Generate integer packing.
const pack = require('./pack')

// Determine necessary variables.
const { serialize: declare } = require('./declare')

// Format source code maintaining indentation.
const $ = require('programmatic')

const Inliner = require('./inline')

// Generate required modules and functions.
const required = require('./required')

// Format source code maintaining indentation.
const join = require('./join')

// Add implicit field definitions to the given array of field definitions.
// Specifically, we split length-encoded arrays into separate nodes for the
// encoding and the array body, and terminated arrays into separate nodes for
// the array body and the terminator. This allows us to inject best-foot-forward
// checkpoints between the array bodies and their sentinals.
//
// All other nodes are merely recursing into their bodies if necessary looking
// for length-encoded and terminated arrays.
function expand (fields) {
    const expanded = []
    for (const field of fields) {
        switch (field.type) {
        case 'conditional':
            for (const condition of field.serialize.conditions) {
                condition.fields = expand(condition.fields)
            }
            expanded.push(field)
            break
        case 'switch':
            for (const when of field.cases) {
                when.fields = expand(when.fields)
            }
            expanded.push(field)
            break
        case 'structure':
        case 'accumulator':
        case 'inline':
            field.fields = expand(field.fields)
            expanded.push(field)
            break
        case 'fixed':
            if (field.calculated) {
                expanded.push({ type: 'calculation', field })
            }
            field.fields = expand(field.fields)
            expanded.push(field)
            break
        case 'terminated':
            field.fields = expand(field.fields)
            expanded.push(field)
            expanded.push({ type: 'terminator', body: field, vivify: null })
            break
        case 'lengthEncoded':
            field.fields = expand(field.fields)
            expanded.push({
                type: 'lengthEncoding', body: field, dotted: field.dotted, vivify: null
            })
            expanded.push(field)
            break
        default:
            expanded.push(field)
            break
        }
    }
    return expanded
}

//

// Inject checkpoint nodes into AST when generating a best-foot-forward parser.
//
// Child nodes for nodes that have children &mdash; which is almost ever node except
// for unpacked integers &mdash; are stored in fields array.
//
// Coming from the AST, all nodes except for structure nodes the field arrays
// always have a single child element. Structure nodes have an element for each
// field in the structure.
//
// The array allows us insert checkpoint nodes. Checkpoint nodes will generate a
// conditional that will ensure that the serialization buffer has enough bytes
// remaining for the next field or fields.
//
// We try to group these so that the sum of a series of contiguous fixed width
// fields in a structure is tested instead of testing each field in turn. You'll
// see that when we have a fixed width field we add its byte value to the the
// first element of the checkpoint.
//
// If we have a field that requires a calculation, such as an multiplying the
// length of an array of words with the byte size of the word type stored in the
// array, we add that to the array of lengths, but we can continue to add fixed
// with values to the first element.
//
// We are able to group fixed with elements and arrays of fixed with elements
// into a single `if` conditional. We've already propagated the fixed nature of
// children to the parent when we created the AST, so a fixed array of fixed
// arrays ought to be itself fixed with. When we get things like arrays of
// variable length arrays we have to perform tests on top of each loop.
//
// When we encouter a node that requires such looping, we add checkpoints to
// that that nodes `fields` property by calling this function `checkpoints`
// array with that nodes fields proeprty and assigning the checkpointed fields
// to the field property.
//
// When we checkpoint child nodes like that we start a new checkpoint for
// subsequent fields. Before we leave the function we strip any checkpoints from
// the array that where never actually used, a checkpoint with a single
// element in it's `lengths` property with a value of `0`.

//
function checkpoints (path, fields, $i = 0, $I = 0) {
    let checkpoint
    const checked = [ checkpoint = { type: 'checkpoint', lengths: [ 0 ] } ]
    for (const field of fields) {
        switch (field.type) {
        case 'structure':
        case 'accumulator':
        case 'inline':
            checked.push(field)
            if (field.fixed) {
                checkpoint.lengths.push(field.bits / 8)
            }  else {
                field.fields = checkpoints(path + field.dotted, field.fields, $i + 1, $I)
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            }
            break
        case 'conditional':
            checked.push(field)
            for (const condition of field.serialize.conditions) {
                condition.fields = checkpoints(path + field.dotted, condition.fields, $i, $I)
            }
            checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            break
        // Checkpoints are evaluated within each specific case.
        //
        // **TODO** If a switch statement resolves all entries to a fixed value
        // with the same bit size, make the switch statement fixed width. This
        // is likely in the case of packed integers, but moot since the integer
        // will itself be fixed. Still likely, however, but not as likely
        // outside of packed integers.
        case 'switch':
            checked.push(field)
            for (const when of field.cases) {
                when.fields = checkpoints(path + field.dotted, when.fields, $i, $I)
            }
            checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            break
        case 'fixed':
            if (field.fixed) {
                checked.push(field)
                checkpoint.lengths[0] += field.bits / 8
            } else {
                checked.push(field)
                if (field.calculated) {
                    field.fields = checkpoints(`${path + field.dotted}[$i[${$i}]]`, field.fields, $i + 1, $I + 1)
                } else {
                    field.fields = checkpoints(`${path + field.dotted}[$i[${$i}]]`, field.fields, $i + 1, $I)
                }
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            }
            break
        case 'calculation':
            if (field.field.fields[0].fixed) {
                checked.push(field)
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
                checkpoint.lengths.push(`$I[${$I}] * ${field.field.fields[0].bits >>> 3}`)
            } else {
                checked.push(field)
            }
            break
        case 'terminator':
            checked.push(field)
            checkpoint.lengths[0] += field.body.terminator.length
            break
        case 'terminated':
            //
            checked.push(field)
            if (field.fields[0].fixed) {
                if (field.fields[0].type == 'buffer' && !field.fields[0].concat) {
                    checkpoint.lengths.push($(`
                        ${path + field.dotted}.reduce((sum, buffer) => sum + buffer.length, 0)
                    `))
                } else {
                    // *Division in string templates upsets Docco JavaScript parser.*
                    checkpoint.lengths.push(`${path + field.dotted}.length * ${field.fields[0].bits >>> 3}`)
                }
            } else {
                field.fields = checkpoints(`${path}${field.dotted}[$i[${$i}]]`, field.fields, $i + 1, $I)
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            }
            break
        case 'lengthEncoded':
            checked.push(field)
            if (field.fields[0].fixed) {
                if (field.fields[0].type == 'buffer' && !field.fields[0].concat) {
                    checkpoint.lengths.push($(`
                        ${path + field.dotted}.reduce((sum, buffer) => sum + buffer.length, 0)
                    `))
                } else {
                    // *Division in string templates upsets Docco JavaScript parser.*
                    checkpoint.lengths.push(`${path + field.dotted}.length * ${field.fields[0].bits >>> 3}`)
                }
            }  else {
                field.fields = checkpoints(`${path}${field.dotted}[$i[${$i}]]`, field.fields, $i + 1, $I)
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            }
            break
        case 'lengthEncoding':
            checked.push(field)
            if (field.body.encoding[0].fixed == true) {
                checkpoint.lengths[0] += field.body.encoding[0].bits / 8
            } else {
                field.body.encoding = checkpoints(`${path}${field.dotted}.length`, field.body.encoding, $i, $I)

                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            }
            break
        case 'literal':
            checked.push(field)
            // **TODO** Unfixed fields padded with literals.
            if (field.fixed) {
                checkpoint.lengths[0] += field.bits / 8
            }
            break
        default:
            checked.push(field)
            checkpoint.lengths[0] += field.bits / 8
            break
        }
    }
    // Remove any list of lengths that begins with a zero constant. There may
    // still be calculated lengths following.
    checked.forEach(field => {
        if (field.type == 'checkpoint' && field.lengths[0] == 0) {
            field.lengths.shift()
        }
    })
    // Remove any checkpoints that only had the zero constant.
    return checked.filter(field => {
        return field.type != 'checkpoint' || field.lengths.length != 0
    })
}

//

// Use only in testing. Inserts a checkpoint before every actual read to ensure
// that we're correctly incrementing the step. Otherwise we have to add a
// complicated subsequent field to every test that the step is set correctly
// because most of the time the checkpoint will evaluate the buffer for the
// length of the entire packet.

//
function inquisition (path, fields, $i = 0, $I = 0) {
    const checked = []
    for (const field of fields) {
        switch (field.type) {
        case 'accumulator':
        case 'inline':
        case 'structure':
            field.fields = inquisition(path + field.dotted, field.fields, $i, $I)
            checked.push(field)
            break
        case 'conditional':
            for (const condition of field.serialize.conditions) {
                condition.fields = inquisition(path + field.dotted, condition.fields, $i, $I)
            }
            checked.push(field)
            break
        case 'switch':
            for (const when of field.cases) {
                when.fields = inquisition(path + field.dotted, when.fields, $i, $I)
            }
            checked.push(field)
            break
        case 'terminated':
            if (field.fields[field.fields.length - 1].type == 'buffer') {
                checked.push({ type: 'checkpoint', lengths: [ 0,
                    field.fields[field.fields.length - 1].concat
                        ? `${path + field.dotted}.length`
                        : `${path + field.dotted}.reduce((sum, buffer) => sum + buffer.length, 0)`
                ]})
            } else {
                field.fields = inquisition(path + field.dotted, field.fields, $i + 1, $I)
            }
            checked.push(field)
            break
        case 'terminator':
            if (field.body.fields[field.body.fields.length - 1].type == 'buffer') {
                checked[checked.length - 2].lengths[0] += field.body.terminator.length
            } else {
                checked.push({ type: 'checkpoint', lengths: [ field.body.terminator.length ]})
            }
            checked.push(field)
            break
        case 'lengthEncoding':
            if (field.body.encoding[0].fixed) {
                checked.push({ type: 'checkpoint', lengths: [ field.body.encoding[0].bits / 8 ]})
            } else {
                field.body.encoding = inquisition(`${path}.length`, field.body.encoding, $i, $I)
            }
            checked.push(field)
            break
        // When we encounter a length encoded buffer, we still skip the whole
        // length encoding with the buffer length. We're not testing checkpoints
        // that will never exist, just that subsequent fields are aligned to the
        // correct step.
        case 'lengthEncoded':
            if (field.fixed) {
                checked.push({ type: 'checkpoint', lengths: [ field.bits / 8 ] })
            } else if (field.fields[field.fields.length - 1].type == 'buffer') {
                checked.push({ type: 'checkpoint', lengths: [
                    0, field.fields[field.fields.length - 1].concat
                        ? `${path + field.dotted}.length`
                        : `${path + field.dotted}.reduce((sum, buffer) => sum + buffer.length, 0)`
                ]})
            } else {
                field.fields = inquisition(path + field.dotted, field.fields, $i + 1, $I + 1)
            }
            checked.push(field)
            break
        case 'absent':
            checked.push(field)
            break
        case 'calculation':
            if (field.field.fields[0].fixed) {
                checked.push(field)
                checked.push({ type: 'checkpoint', lengths: [ `$I[${$I}] * ${field.field.fields[0].bits >>> 3}` ]})
            } else {
                checked.push(field)
            }
            break
        case 'fixed':
            if (field.fixed) {
                checked.push({ type: 'checkpoint', lengths: [ field.bits / 8 ]})
                checked.push(field)
            } else {
                if (field.calculated) {
                    field.fields = inquisition(path + field.dotted, field.fields, $i + 1, $I + 1)
                } else {
                    field.fields = inquisition(path + field.dotted, field.fields, $i + 1, $I)
                }
                checked.push(field)
            }
            break
        case 'buffer':
        case 'bigint':
        case 'integer':
        case 'literal':
            checked.push({ type: 'checkpoint', lengths: [ field.bits / 8 ]})
            checked.push(field)
            break
        default:
            throw new Error(field.type)
        }
    }
    return checked
}

// TODO lookup just got weird, normalize it across packetize and cycle.
function generate (packet, { require = null, bff, chk, lookup = '' }) {
    let $step = 0, $i = -1, $I = -1, $$ = -1

    const { variables, parameters, accumulators } = declare(packet)

    const inliner = Inliner({
        variables, parameters, accumulators, packet,
        direction: 'serialize'
    })

    function checkpoint (checkpoint) {
        if (checkpoint.lengths.length == 0) {
            return null
        }
        const signatories = {
            packet: packet.name,
            parameters: '{}',
            step: $step,
            i: '$i',
            I: '$I',
            stack: '$$',
            accumulator: '$accumulator',
            starts: '$starts'
        }
        if (Object.keys(parameters).length != 0) {
            const properties = []
            for (const parameter in parameters) {
                properties.push(`${parameter}: ${parameter}`)
            }
            signatories.parameters = $(`
                {
                    `, properties.join(', '), `
                }
            `)
        }
        const signature = Object.keys(signatories)
                                .filter(key => variables[key])
                                .map(key => signatories[key])
        return $(`
            if ($end - $start < ${checkpoint.lengths.join(' + ')}) {
                return $incremental.${packet.name}(`, signature.join(', '), `)($buffer, $start, $end)
            }
        `)
    }

    function absent (path, field) {
        $step++
        return null
    }
    //

    // Write an integer value converting the object property value to an integer
    // if necessary. This is the generated source common to `number` and
    // `BigInt`. Convert the object property value if it is a lookup value or a
    // packed integer. No conversion is necessary for two's compliment.
    function write (path, field, write) {
        if (homogeneous(field)) {
            $step += 2
        } else {
            $step += 1 + field.bytes.length
        }
        if (field.fields) {
            const packing = pack(inliner, field, path)
            return $(`
                `, packing, `

                `, write, `
            `)
        } else if (field.lookup) {
            if (Array.isArray(field.lookup.values)) {
                return $(`
                    $_ = $lookup[${field.lookup.index}].indexOf(${path})

                    `, write, `
                `)
            }
            return $(`
                $_ = $lookup[${field.lookup.index}].reverse[${path}]

                `, write, `
            `)
        } else {
            return write
        }
    }
    //

    // Write a `number` to the underlying buffer.
    function integer (path, field) {
        const value = field.lookup != null || field.fields != null ? '$_' : path
        const writes = []
        for (let i = 0, I = field.bits / 8; i< I; i++) {
            const { shift, mask, upper } = field.bytes[i]
            const shifted = shift != 0 ? `${value} >>> ${shift}` : value
            const lower = `${shifted} & ${hex(mask)}`
            if (upper != 0) {
                writes.push(`$buffer[$start++] = ${lower} | ${hex(upper)}`)
            } else {
                writes.push(`$buffer[$start++] = ${lower}`)
            }
        }
        return write(path, field, writes.join('\n'))
    }
    //

    // Write a `BigInt` to the underlying buffer.
    function bigint (path, field) {
        const value = field.lookup != null || field.fields != null ? '$_' : path
        const writes = []
        for (let i = 0, I = field.bits / 8; i< I; i++) {
            const { shift, mask, upper } = field.bytes[i]
            const shifted = shift != 0 ? `${value} >> ${shift}n` : value
            const lower = `Number(${shifted} & ${hex(mask)}n)`
            if (upper != 0) {
                writes.push(`$buffer[$start++] = ${lower} | ${hex(upper)}`)
            } else {
                writes.push(`$buffer[$start++] = ${lower}`)
            }
        }
        return write(path, field, writes.join('\n'))
    }

    // TODO You need to test incrementing step correctly when contained variable
    // is variable length and not fixed. Not yet implemented.
    function literal (path, field) {
        function write (literal) {
            switch (literal.repeat) {
            case 0:
                return null
            case 1:
                $step += 2
                return $(`
                    $buffer.write(${util.inspect(literal.value)}, $start, $start + ${literal.value.length >>> 1}, 'hex')
                    $start += ${literal.value.length >>> 1}
                `)
            default:
                $step += 4
                return $(`
                    for ($i[${$i + 1}] = 0; $i[${$i + 1}] < ${literal.repeat}; $i[${$i + 1}]++) {
                        $buffer.write(${JSON.stringify(literal.value)}, $start, $start + ${literal.value.length >>> 1}, 'hex')
                        $start += ${literal.value.length >>> 1}
                    }
                `)
            }
        }
        return $(`
            `, write(field.before), -1, `

            `, map(dispatch, path, field.fields), `

            `, -1, write(field.after), `
        `)
    }

    function inline (path, field) {
        const inline = inliner.inline(path, field.before)
        if (inline.inlined != null || inline.starts != null) {
            $step++
        }
        return $(`
            `, inline.inlined, -1, `

            `, inline.starts, -1, `

            `, map(dispatch, inline.path, field.fields), `

            `, -1, inliner.pop(), `
        `)
    }

    function accumulator (path, field) {
        $step++
        return $(`
            `, inliner.accumulator(field), `

            `, map(dispatch, path, field.fields), `
        `)
    }

    //
    // **Length-encoded arrays**: Serialize first the length of the array as an
    // integer followed by the array elements in a loop.
    //
    // We split the AST node into two separate nodes for the encoding and the
    // elements so we can do a best-foot-forward check that combines the
    // encoding with any fixed fields that come before it, and check the array
    // elements separately if they are variable length.
    //

    // Serialize the length of of a length-encoded array.
    function lengthEncoding (path, field) {
        const element = field.body.fields[field.body.fields.length - 1]
        // If we have a chunked buffers, we have to serialize the sum of all the
        // buffers in an array of buffers.
        if (element.type == 'buffer') {
            if (element.concat) {
                return map(dispatch, `${path}.length`, field.body.encoding)
            }
            $step++
            // We need to use `$I` in case our length encoding is conditional
            // and we have a checkpoint following it. When we drop into
            // incremental we'll have passed the point where it sums the buffer
            // lengths.
            return $(`
                $I[${++$I}] = ${path}.reduce((sum, buffer) => sum + buffer.length, 0)
                `, map(dispatch, `$I[${$I}]`, field.body.encoding), `
            `)
        }
        // Otherwise serialize the array length.
        return $(`
            `, map(dispatch, `${path}.length`, field.body.encoding), `
            $i[${++$i}] = 0
        `)
    }
    //

    // Serialize the elements of a length-encoded array.
    function lengthEncoded (path, field) {
        const element = field.fields[field.fields.length - 1]
        if (element.type == 'buffer') {
            $step += element.concat ? 1 : 1
            if (element.concat) {
                // Straight up copy the buffer into the serialization buffer.
                return $(`
                    ${path}.copy($buffer, $start, 0, ${path}.length)
                    $start += ${path}.length
                `)
            }
            $I--
            // Copy each buffer in an array of buffer to the serialization
            // buffer. We can use a block scope variable, best-foot-forward
            // checks have already been performed.
            return $(`
                {
                    for (let i = 0, I = ${path}.length; i < I; i++) {
                        ${path}[i].copy($buffer, $start, 0, ${path}[i].length)
                        $start += ${path}[i].length
                    }
                }
            `)
        }
        // Generate serialization for the array body. We loop over the elements
        // using an index we can pass to the incremental parser during
        // best-foot-foward serialization.
        $step++
        const i = `$i[${$i}]`
        const source = $(`
            for (; ${i} < ${path}.length; ${i}++) {
                `, map(dispatch, `${path}[${i}]`, field.fields), `
            }
        `)
        $i--
        return source
    }

    function terminated (path, field) {
        const element = field.fields[field.fields.length - 1]
        if (element.type == 'buffer') {
            $step += 2
            if (element.concat) {
                return $(`
                    ${path}.copy($buffer, $start, 0, ${path}.length)
                    $start += ${path}.length
                `)
            }
            variables.register = true
            return $(`
                $_ = 0
                for (let $index = 0; $index < ${path}.length; $index++) {
                    ${path}[$index].copy($buffer, $start)
                    $start += ${path}[$index].length
                    $_ += ${path}[$index].length
                }
            `)
        }
        $step += 1
        const i = `$i[${++$i}]`
        const looped = join(field.fields.map(field => dispatch(`${path}[${i}]`, field)))
        const source = $(`
            for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                `, looped, `
            }
        `)
        $i--
        return source
    }

    function terminator (field) {
        const terminator = []
        $step += field.body.terminator.length
        if (field.body.fields[field.body.fields.length - 1].type != 'buffer') {
            $step++
        }
        for (const bite of field.body.terminator) {
            terminator.push(`$buffer[$start++] = ${hex(bite)}`)
        }
        return terminator.join('\n')
    }

    function calculation (path, { field }) {
        return $(`
            $I[${++$I}] = `, inliner.test(path, field.length), `
        `)
    }

    function fixed (path, field) {
        const element = field.fields[field.fields.length - 1]
        const length = field.calculated ? `$I[${$I}]` : field.length
        if (element.type == 'buffer') {
            $I--
            $step += 2
            let source = ''
            variables.register = true
            // For whole buffers, we slice the buffer out of the underlying
            // buffer.
            //
            // **TODO** Create buffer as `null` in vivified object for bff parse
            // because we're allocating memory we might not use if we end up
            // failing toward incremental parse. Oh, no, better still, let's
            // slice the incoming buffer. If this bothers the user, they can
            // make a copy of the buffer on parse using an inline.
            if (element.concat) {
                source = $(`
                    $_ = 0
                    ${path}.copy($buffer, $start)
                    $start += ${path}.length
                    $_ += ${path}.length
                `)
            // If we're gathering the chunks, we push them onto an array of
            // chunks.
            } else {
                const i = `$i[${++$i}]`
                source = $(`
                    $_ = 0
                    for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                        ${path}[${i}].copy($buffer, $start)
                        $start += ${path}[${i}].length
                        $_ += ${path}[${i}].length
                    }
                `)
                $i--
            }
            if (field.pad.length == 0) {
                return source
            }
            $step += 2
            const fill = field.pad.length > 1 ? `Buffer.from(${hex(field.pad)})` : hex(field.pad[0])
            return $(`
                `, source, `

                $_ = ${length} - $_
                $buffer.fill(${fill}, $start, $start + $_)
                $start += $_
            `)
        }
        $step += 1 + field.pad.length
        const i = `$i[${++$i}]`
        const looped = map(dispatch, `${path}[${i}]`, field.fields)
        const pad = field.pad.length == 0 ? null : $(`
            for (;;) {
                `, join(field.pad.map((bite, index) => {
                    return $(`
                        if (${i} == ${length}) {
                            break
                        }
                        $buffer[$start++] = ${hex(bite)}
                        ${i}++
                    `)
                })), `
            }
        `)
        let source = null
        if (field.calculated) {
            const I = `$I[${$I}]`
            // TODO Now have to increment `$I` in checkpoints and inquisition.
            // Also, need to add `$I` to serialization side.
            if (field.pad.length != 0) {
                source = $(`
                    for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                        `, looped, `
                    }

                    `, -1, pad, `
                `)
            } else {
                source = $(`
                    for (${i} = 0; ${i} < ${I}; ${i}++) {
                        `, looped, `
                    }

                    `, -1, pad, `
                `)
            }
            $I--
        } else {
            source = $(`
                for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                    `, looped, `
                }

                `, -1, pad, `
            `)
        }
        $i--
        return source
    }

    function switched (path, field) {
        $step++
        const cases = []
        for (const when of field.cases) {
            cases.push($(`
                ${when.otherwise ? 'default' : `case ${util.inspect(when.value)}`}:

                    `, join(when.fields.map(field => dispatch(path + field.dotted, field))), `

                    break
            `))
        }
        const invocations = inliner.accumulations([ field.select ])
        return $(`
            `, invocations, -1, `

            switch (`, inliner.test(path, field.select), `) {
            `, join(cases), `
            }
        `)
    }

    function conditional (path, field) {
        const block = []
        const tests = field.serialize.conditions.filter(condition => condition.test != null)
                                                .map(condition => condition.test)
        const invocations = inliner.accumulations(tests)
        $step++
        let ladder = '', keywords = 'if'
        for (let i = 0, I = field.serialize.conditions.length; i < I; i++) {
            const condition = field.serialize.conditions[i]
            const source = join(condition.fields.map(field => dispatch(path, field)))
            ladder = condition.test != null ? function () {
                const signature = field.split ? [ path ] : []
                const test = inliner.test(path, condition.test, signature)
                return $(`
                    `, ladder, `${keywords} (`, test ,`) {
                        `, source, `
                    }
                `)
            } () : $(`
                `, ladder, ` else {
                    `, source, `
                }
            `)
            keywords = ' else if'
        }
        return $(`
            `, invocations, -1, `

            `, ladder, `
        `)
    }
    //

    // Dispatch based on field type.
    function dispatch (path, field) {
        switch (field.type) {
        case 'structure':
            return map(dispatch, path, field.fields)
        case 'conditional':
            return conditional(path, field)
        case 'switch':
            return switched(path, field)
        case 'fixed':
            return fixed(path, field)
        case 'calculation':
            return calculation(path, field)
        case 'terminator':
            return terminator(field)
        case 'terminated':
            return terminated(path, field)
        case 'lengthEncoded':
            return lengthEncoded(path, field)
        case 'lengthEncoding':
            return lengthEncoding(path, field)
        case 'accumulator':
            return accumulator(path, field)
        case 'inline':
            return inline(path, field)
        case 'literal':
            return literal(path, field)
        case 'bigint':
            return bigint(path, field)
        case 'integer':
            return integer(path, field)
        case 'absent':
            return absent(path, field)
        case 'checkpoint':
            return checkpoint(field)
        default:
            throw new Error
        }
    }

    function generate () {
        const source = dispatch(packet.name, packet)
        const declarations = {
            register: '$_',
            i: '$i = []',
            I: '$I = []',
            stack: '$$ = []',
            sip: '$sip = []',
            accumulator: '$accumulator = {}',
            starts: '$starts = []'
        }
        const lets = Object.keys(declarations)
                                .filter(key => variables[key])
                                .map(key => declarations[key])

        const requires = required(require)

        const signature = []

        if (Object.keys(parameters).length != 0) {
            const properties = []
            for (const parameter in parameters) {
                properties.push(`${parameter} = ${parameters[parameter]}`)
            }
            signature.push($(`
                {
                    `, properties.join(', '), `
                } = {}
            `))
        }

        assert.equal($i, -1)

        if (bff || chk) {
            signature.unshift(packet.name)
            return $(`
                function (${lookup ? '$lookup' : ''}) {
                    `, requires, -1, `

                    return function (`, signature.join(', '), `) {
                        return function ($buffer, $start, $end) {
                            `, lets.length != 0 ? `let ${lets.join(', ')}` : null, -1, `

                            `, source, -1, `

                            return { start: $start, serialize: null }
                        }
                    }
                } (${lookup || ''})
            `)
        }

        signature.unshift(packet.name, '$buffer', '$start')
        return $(`
            function (${lookup ? '$lookup' : ''}) {
                `, requires, -1, `

                return function (`, signature.join(', '), `) {
                    `, lets.length != 0 ? `let ${lets.join(', ')}` : null, -1, `

                    `, source, -1, `

                    return { start: $start, serialize: null }
                }
            } (${lookup})
        `)
    }

    return generate()
}

module.exports = function (definition, options = {}) {
    const expanded = expand(JSON.parse(JSON.stringify(definition)))
    const source = expanded.map(function (packet) {
        if (options.chk) {
            packet.fields = inquisition(packet.name, packet.fields)
        } else if (options.bff) {
            packet.fields = checkpoints(packet.name, packet.fields)
        }
        const source = generate(packet, options)
        return $(`
            ${packet.name}: `, source, `
        `)
    })
    return $(`
        {
            `, source.join(',\n'), `
        }
    `)
}
