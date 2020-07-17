// Node.js API.
const assert = require('assert')

const map = require('./map')

// Convert numbers and arrays to numbers to literals with hex literals.
const hex = require('./hex')

// Generate integer packing.
const pack = require('./pack')

// Determine necessary variables.
const { serialize: declare } = require('./declare')

// Format source code maintaining indentation.
const $ = require('programmatic')

// Generate accumulator declaration source.
const accumulatorer = require('./accumulator')

// Generate invocations of accumulators before conditionals.
const accumulations = require('./accumulations')

// Generate inline function source.
const inliner = require('./inliner')

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
        case 'lengthEncoded':
            field.fields = expand(field.fields)
            expanded.push({
                type: 'lengthEncoding', body: field, dotted: field.dotted, vivify: null
            })
            expanded.push(field)
            break
        case 'terminated':
            field.fields = expand(field.fields)
            expanded.push(field)
            expanded.push({ type: 'terminator', body: field, vivify: null })
            break
        case 'fixed':
        case 'inline':
        case 'accumulator':
        case 'structure':
            field.fields = expand(field.fields)
            expanded.push(field)
            break
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
// Comeing from the AST, all nodes except for structure notes the field arrays
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
function checkpoints (path, fields, index = 0) {
    let checkpoint
    const checked = [ checkpoint = { type: 'checkpoint', lengths: [ 0 ] } ]
    for (const field of fields) {
        switch (field.type) {
        case 'literal':
            checked.push(field)
            // **TODO** Unfixed fields padded with literals.
            if (field.fixed) {
                checkpoint.lengths[0] += field.bits / 8
            }
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
                field.fields = checkpoints(`${path}${field.dotted}[$i[${index}]]`, field.fields, index + 1)
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            }
            break
        case 'terminator':
            checked.push(field)
            checkpoint.lengths[0] += field.body.terminator.length
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
                when.fields = checkpoints(path + field.dotted, when.fields, index)
            }
            checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            break
        case 'conditional':
            checked.push(field)
            for (const condition of field.serialize.conditions) {
                condition.fields = checkpoints(path + field.dotted, condition.fields, index)
            }
            checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            break
        case 'lengthEncoding':
            checked.push(field)
            checkpoint.lengths[0] += field.body.encoding[0].bits / 8
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
                field.fields = checkpoints(`${path}${field.dotted}[$i[${index}]]`, field.fields, index + 1)
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            }
            break
        case 'accumulator':
        case 'inline':
        case 'structure':
            checked.push(field)
            if (field.fixed) {
                checkpoint.lengths.push(field.bits / 8)
            }  else {
                field.fields = checkpoints(path + field.dotted, field.fields, index + 1)
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
            }
            break
        default:
            checked.push(field)
            checkpoint.lengths[0] += field.bits / 8
            break
        }
    }
    // **TODO** Merge these two functions.
    checked.forEach(field => {
        if (field.type == 'checkpoint' && field.lengths[0] == 0) {
            field.lengths.shift()
        }
    })
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
function inquisition (path, fields) {
    const checked = []
    for (const field of fields) {
        switch (field.type) {
        case 'accumulator':
        case 'inline':
        case 'structure':
            field.fields = inquisition(path + field.dotted, field.fields)
            checked.push(field)
            break
        case 'conditional':
            for (const condition of field.serialize.conditions) {
                condition.fields = inquisition(path + field.dotted, condition.fields)
            }
            checked.push(field)
            break
        case 'switch':
            for (const when of field.cases) {
                when.fields = inquisition(path + field.dotted, when.fields)
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
                field.fields = inquisition(path + field.dotted, field.fields)
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
            checked.push({ type: 'checkpoint', lengths: [ field.body.encoding[0].bits / 8 ]})
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
                const lengthEncoding = checked[checked.length - 2]
                lengthEncoding.lengths.push(field.fields[field.fields.length - 1].concat
                    ? `${path + field.dotted}.length`
                    : `${path + field.dotted}.reduce((sum, buffer) => sum + buffer.length, 0)`
                )
            } else {
                field.fields = inquisition(path + field.dotted, field.fields)
            }
            checked.push(field)
            break
        case 'absent':
            checked.push(field)
            break
        case 'fixed':
        case 'buffer':
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

function generate (packet, { require = null, bff, chk }) {
    let $step = 0, $i = -1, $$ = -1

    const variables = declare (packet)

    const accumulate = {
        accumulator: {},
        accumulated: [],
        buffered: [],
        variables: variables,
        packet: packet.name,
        direction: 'serialize'
    }

    function absent (path, field) {
        $step++
        return null
    }

    function word (assignee, field) {
        const bytes = field.bits / 8
        let bite = field.endianness == 'big' ? bytes - 1 : 0
        const stop = field.endianness == 'big' ? -1 : bytes
        const direction = field.endianness == 'big' ? -1 : 1
        const shifts = []
        const cast = field.bits > 32
            ? { to: 'n', from: 'Number', shift: '>>' }
            : { to: '', from: '', shift: '>>>' }
        while (bite != stop) {
            const shift = bite ? `${assignee} ${cast.shift} ${bite * 8}${cast.to}` : assignee
            shifts.push(`$buffer[$start++] = ${cast.from}(${shift} & 0xff${cast.to})`)
            bite += direction
        }
        return shifts.join('\n')
    }

    function integer (path, field) {
        $step += 2
        if (field.fields) {
            const packing = pack(accumulate, packet, field, path, '$_')
            return $(`
                `, packing, `

                `, word('$_', field), `
            `)
        } else if (field.lookup) {
            if (Array.isArray(field.lookup.values)) {
                return $(`
                    $_ = $lookup[${field.lookup.index}].indexOf(${path})

                    `, word('$_', field), `
                `)
            }
            return $(`
                $_ = $lookup[${field.lookup.index}].reverse[${path}]

                `, word('$_', field), `
            `)
        } else {
            return word(path, field)
        }
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
                    $buffer.write(${JSON.stringify(literal.value)}, $start, $start + ${literal.value.length >>> 1}, 'hex')
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
        if (element.type == 'buffer' && !element.concat) {
            return $(`
                {
                    const length = ${path}.reduce((sum, buffer) => sum + buffer.length, 0)
                    `, map(dispatch, 'length', field.body.encoding), `
                }
            `)
        }
        // Otherwise serialize the array length.
        return map(dispatch, `${path}.length`, field.body.encoding)
    }
    //

    // Serialize the elements of a length-encoded array.
    function lengthEncoded (path, field) {
        const element = field.fields[field.fields.length - 1]
        if (element.type == 'buffer') {
            $step += element.concat ? 1 : 2
            return element.concat
            // Straight up copy the buffer into the serialization buffer.
            ? $(`
                ${path}.copy($buffer, $start, 0, ${path}.length)
                $start += ${path}.length
            `)
            // Copy each buffer in an array of buffer to the serialization
            // buffer. We can use a block scope variable, best-foot-forward
            // checks have already been performed.
            : $(`
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
        const i = `$i[${++$i}]`
        const source = $(`
            for (${i} = 0; ${i} < ${path}.length; ${i}++) {
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

    function fixed (path, field) {
        const element = field.fields[field.fields.length - 1]
        if (element.type == 'buffer') {
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

                $_ = ${field.length} - $_
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
                        if (${i} == ${field.length}) {
                            break
                        }
                        $buffer[$start++] = 0x${bite.toString(16)}
                        ${i}++
                    `)
                })), `
            }
        `)
        const source = $(`
            for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                `, looped, `
            }

            `, -1, pad, `
        `)
        $i--
        return source
    }

    function inline (path, field) {
        const before = field.before.length != 0 ? function () {
            const register = `$$[${++$$}]`
            const inline = inliner(accumulate, path, field.before, [
                path, register
            ], register)
            if (inline.buffered.start != inline.buffered.end) {
                $step++
            }
            if (inline.inlined.length == 0) {
                return { path: path, source: null, buffered: inline.buffered }
            }
            return {
                path: inline.register,
                source: join(inline.inlined),
                buffered: inline.buffered
            }
        } () : {
            path: path,
            source: null,
            buffered: {
                start: accumulate.buffered.length,
                end: accumulate.buffered.length
            }
        }
        if (before.path[0] != '$') {
            $$--
        }
        const starts = []
        for (let i = before.buffered.start, I = before.buffered.end; i < I; i++) {
            starts.push(`$starts[${i}] = $start`)
        }
        if (before.source != null) {
            $step++
        }
        const source = map(dispatch, before.path, field.fields)
        const buffered = accumulate.buffered
            .splice(0, before.buffered.end)
            .map(buffered => {
                return buffered.source
            })
        if (before.path[0] == '$') {
            $$--
        }
        return  $(`
            `, starts.length != 0 ? starts.join('\n') : null, -1, `

            `, before.source, -1, `

            `, source, `

            `, -1, buffered.length != 0 ? buffered.join('\n') : null, `
        `)
    }

    function conditional (path, field) {
        const block = []
        const invocations = accumulations({
            functions: field.serialize.conditions.map(condition => condition.test),
            accumulate: accumulate
        })
        $step++
        let ladder = '', keywords = 'if'
        for (let i = 0, I = field.serialize.conditions.length; i < I; i++) {
            const condition = field.serialize.conditions[i]
            const source = join(condition.fields.map(field => dispatch(path, field)))
            ladder = condition.test != null ? function () {
                const registers = field.split ? [ path ] : []
                const f = inliner(accumulate, path, [ condition.test ], registers)
                return $(`
                    `, ladder, `${keywords} (`, f.inlined.shift() ,`) {
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

    function switched (path, field) {
        $step++
        const cases = []
        for (const when of field.cases) {
            cases.push($(`
                ${when.otherwise ? 'default' : `case ${JSON.stringify(when.value)}`}:

                    `, join(when.fields.map(field => dispatch(path + field.dotted, field))), `

                    break
            `))
        }
        const invocations = accumulations({
            functions: [ field.select ],
            accumulate: accumulate
        })
        const inlined = inliner(accumulate, path, [ field.select ], [])
        const select = field.stringify
            ? `String(${inlined.inlined.shift()})`
            : inlined.inlined.shift()
        return $(`
            `, invocations, -1, `

            switch (`, select, `) {
            `, join(cases), `
            }
        `)
    }

    function accumulator (path, field) {
        $step++
        return $(`
            `, accumulatorer(accumulate, field), `

            `, map(dispatch, path, field.fields), `
        `)
    }

    function checkpoint (checkpoint) {
        if (checkpoint.lengths.length == 0) {
            return null
        }
        const signatories = {
            packet: packet.name,
            step: $step,
            i: '$i',
            stack: '$$',
            accumulator: '$accumulator',
            starts: '$starts'
        }
        const signature = Object.keys(signatories)
                                .filter(key => variables[key])
                                .map(key => signatories[key])
        return $(`
            if ($end - $start < ${checkpoint.lengths.join(' + ')}) {
                return serializers.inc.object(${signature.join(', ')})($buffer, $start, $end)
            }
        `)
    }
    //

    // Dispatch based on field type.
    function dispatch (path, field) {
        switch (field.type) {
        case 'structure':
            return join(field.fields.map(field => dispatch(path + field.dotted, field)))
        case 'checkpoint':
            return checkpoint(field)
        case 'accumulator':
            return accumulator(path, field)
        case 'switch':
            return switched(path, field)
        case 'conditional':
            return conditional(path, field)
        case 'inline':
            return inline(path, field)
        case 'fixed':
            return fixed(path, field)
        case 'terminated':
            return terminated(path, field)
        case 'terminator':
            return terminator(field)
        case 'lengthEncoding':
            return lengthEncoding(path, field)
        case 'lengthEncoded':
            return lengthEncoded(path, field)
        case 'buffer':
        case 'bigint':
        case 'integer':
            return integer(path, field)
        case 'literal':
            return literal(path, field)
        case 'absent':
            return absent(path, field)
        default:
            throw new Error
        }
    }

    const source = dispatch(packet.name, packet)
    const declarations = {
        register: '$_',
        i: '$i = []',
        stack: '$$ = []',
        sip: '$sip = []',
        accumulator: '$accumulator = {}',
        starts: '$starts = []'
    }
    const lets = Object.keys(declarations)
                            .filter(key => variables[key])
                            .map(key => declarations[key])

    const requires = required(require)

    assert.equal($i, -1)

    return $(`
        serializers.${bff ? 'bff' : chk ? 'chk' : 'all'}.${packet.name} = function () {
            `, requires, -1, `

            return function (${packet.name}) {
                return function ($buffer, $start, $end) {
                    `, lets.length != 0 ? `let ${lets.join(', ')}` : null, -1, `

                    `, source, `

                    return { start: $start, serialize: null }
                }
            }
        } ()
    `)
}

module.exports = function (definition, options = {}) {
    const expanded = expand(JSON.parse(JSON.stringify(definition)))
    return join(expanded.map(function (packet) {
        if (options.chk) {
            packet.fields = inquisition(packet.name, packet.fields)
        } else if (options.bff) {
            packet.fields = checkpoints(packet.name, packet.fields)
        }
        return generate(packet, options)
    }))
}
