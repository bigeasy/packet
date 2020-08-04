// Node.js API.
const util = require('util')

// Determine if an integer parse should be unrolled.
const { parse: homogeneous } = require('./homogeneous')

// Format source code maintaining indentation.
const $ = require('programmatic')

// Convert numbers and arrays to numbers to literals with hex literals.
const hex = require('./hex')

// Generate literal object construction.
const vivify = require('./vivify')

const Inliner = require('./inline')

// Generate two's compliment conversion.
const unsign = require('./fiddle/unsign')

// Generate integer unpacking.
const unpack = require('./unpack')

// Determine necessary variables.
const { parse: declare } = require('./declare')

// Generate required modules and functions.
const required = require('./required')

const map = require('./map')

// Format source code maintaining indentation.
const join = require('./join')

function expand (fields) {
    const expanded = []
    for (const field of fields) {
        switch (field.type) {
        case 'structure':
        case 'inline':
        case 'accumulator':
            field.fields = expand(field.fields)
            expanded.push(field)
            break
        case 'parse':
            for (const condition of field.conditions) {
                condition.fields = expand(condition.fields)
            }
            expanded.push(field)
            break
        case 'conditional':
            for (const condition of field.parse.conditions) {
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
        case 'fixed':
            if (field.calculated) {
                expanded.push({ type: 'calculation', field, vivify: null })
            }
            field.fields = expand(field.fields)
            expanded.push(field)
            break
        case 'terminated':
            field.fields = [{
                type: 'terminator', body: field, dotted: '', vivify: null
            }, {
                type: 'repeated',
                body: field,
                fields: expand(field.fields),
                dotted: '',
                vivify: 'array'
            }]
            expanded.push(field)
            break
        case 'lengthEncoded':
            field.fields = expand(field.fields)
            expanded.push({ type: 'lengthEncoding', body: field, vivify: null })
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

// Insert checkpoints for best-foot-forward search. See the detailed description
// of checkpoint inseration in [`serialize.all.js`](serialize.all.js.html),
// since it follows the same principle.

//
function checkpoints (path, fields, $i = 0, $I = 0) {
    let checkpoint = { type: 'checkpoint', lengths: [ 0 ], vivify: null, rewind: 0 }
    const checked = [ checkpoint ]
    for (const field of fields) {
        switch (field.type) {
        case 'structure':
        case 'accumulator':
        case 'inline':
        case 'inline':
            checked.push(field)
            if (field.fixed) {
                checkpoint.lengths[0] += field.bits / 8
            } else {
                // TODO Could start from the nested checkpoint since we are are
                // not actually looping for the structure.
                field.fields = checkpoints(path + field.dotted, field.fields, $i, $I)
                checked.push(checkpoint = {
                    type: 'checkpoint', lengths: [ 0 ], vivify: null, rewind: 0
                })
            }
            break
        case 'switch':
            checked.push(field)
            for (const when of field.cases) {
                when.fields = checkpoints(path + field.dotted, when.fields, $i)
            }
            checked.push(checkpoint = {
                type: 'checkpoint', lengths: [ 0 ], vivify: null, rewind: 0
            })
            break
        case 'parse': {
                checked.push(field)
                field.sip = checkpoints(path + field.dotted, field.sip, $i, $I)
                for (const condition of field.conditions) {
                    condition.fields = checkpoints(path + field.dotted, condition.fields, $i, $I)
                }
                checked.push(checkpoint = {
                    type: 'checkpoint', lengths: [ 0 ], vivify: null, rewind: 0
                })
            }
            break
        case 'conditional':
            checked.push(field)
            // TODO Sip belongs outside since it is generally a byte or so.
            if (field.parse.sip != null) {
                field.parse.sip = checkpoints(path + field.dotted, field.parse.sip, $i, $I)
            }
            for (const condition of field.parse.conditions) {
                condition.fields = checkpoints(path + field.dotted, condition.fields, $i, $I)
            }
            checked.push(checkpoint = {
                type: 'checkpoint', lengths: [ 0 ], vivify: null, rewind: 0
            })
            break
        case 'fixed':
            if (field.fixed) {
                checked.push(field)
                checkpoint.lengths[0] += field.bits / 8
            } else {
                checked.push(field)
                if (field.calculated) {
                    field.fields = checkpoints(`${path}${field.dotted}[$i[${$i}]]`, field.fields, $i + 1, $I + 1)
                } else {
                    field.fields = checkpoints(`${path}${field.dotted}[$i[${$i}]]`, field.fields, $i + 1, $I)
                }
                checked.push(checkpoint = {
                    type: 'checkpoint', lengths: [ 0 ], vivify: null, rewind: 0
                })
            }
            break
        case 'calculation':
            if (field.field.fields[0].fixed) {
                checked.push(field)
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ], vivify: null, rewind: 0 })
                checkpoint.lengths.push(`$I[${$I}] * ${field.field.fields[0].bits >>> 3}`)
            } else {
                checked.push(field)
            }
            break
        case 'terminator':
            checked.push(field)
            checkpoint.lengths[0] += field.body.terminator.length
            break
        // TODO Checkpoint invocation on fields in two places?
        case 'repeated':
            // TODO If the terminator is greater than or equal to the size of
            // the repeated part, we do not have to perform the checkpoint.
            checked.push(field)
            field.fields = checkpoints(path, field.fields, $i, $I)
            break
        case 'terminated':
            checked.push(field)
            const element = field.fields.slice().pop().fields.slice().pop()
            if (element.type != 'buffer') {
                field.fields = checkpoints(path + `${field.dotted}[$i[${$i}]]`, field.fields, $i + 1, $I)
            }
            checked.push(checkpoint = {
                type: 'checkpoint', lengths: [ 0 ], vivify: null, rewind: 0
            })
            break
        case 'lengthEncoded':
            checked.push(field)
            if (field.fields[0].fixed) {
                // Tricky, stick the checkpoint for a fixed array at the end of
                // the encoding fields. Let any subsequent fields use the
                // checkpoint.
                checkpoint.lengths.push(`${field.fields[0].bits >>> 3} * $I[${$I}]`)
            } else {
                field.fields = checkpoints(`${path}${field.dotted}[$i[${$i}]]`, field.fields, $i + 1, $I + 1)
                checked.push(checkpoint = {
                    type: 'checkpoint', lengths: [ 0 ], vivify: null, rewind: 0
                })
            }
            break
        case 'lengthEncoding':
            checked.push(field)
            checkpoint.lengths[0] += field.body.encoding[0].bits / 8
            checked.push(checkpoint = {
                type: 'checkpoint', lengths: [ 0 ], vivify: null, rewind: 0
            })
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
function inquisition (fields, $I = 0) {
    const checked = []
    for (const field of fields) {
        switch (field.type) {
        case 'structure':
        case 'accumulator':
        case 'inline':
            field.fields = inquisition(field.fields)
            checked.push(field)
            break
        // TODO Make the type 'sip' and have it be similar.
        case 'parse':
            if (field.sip != null) {
                field.sip = inquisition(field.sip)
            }
            for (const condition of field.conditions) {
                condition.fields = inquisition(condition.fields)
            }
            checked.push(field)
            break
        case 'conditional':
            if (field.parse.sip != null) {
                field.parse.sip = inquisition(field.parse.sip)
            }
            for (const condition of field.parse.conditions) {
                condition.fields = inquisition(condition.fields)
            }
            checked.push(field)
            break
        case 'switch':
            for (const when of field.cases) {
                when.fields = inquisition(when.fields)
            }
            checked.push(field)
            break
        case 'fixed':
            if (field.fixed) {
                checked.push({
                    type: 'checkpoint',
                    lengths: [ field.bits / 8 ],
                    vivify: null,
                    rewind: 0
                })
                checked.push(field)
            } else {
                if (field.calculated) {
                    field.fields = inquisition(field.fields, $I + 1)
                } else {
                    field.fields = inquisition(field.fields, $I)
                }
                checked.push(field)
            }
            break
        case 'calculation':
            if (field.field.fields[0].fixed) {
                checked.push(field)
                checked.push({
                    type: 'checkpoint',
                    lengths: [ `$I[${$I}] * ${field.field.fields[0].bits >>> 3}` ],
                    vivify: null,
                    rewind: 0
                })
            } else {
                checked.push(field)
            }
            break
        case 'terminator':
            checked.push({
                type: 'checkpoint',
                lengths: [ 0 ],
                vivify: null,
                rewind: 0
            })
            if (field.body.fields[field.body.fields.length - 1].type != 'buffer') {
                checked[checked.length - 1].lengths[0] += field.body.terminator.length
            }
            checked.push(field)
            break
        case 'repeated':
            field.fields = inquisition(field.fields)
            checked.push(field)
            break
        case 'terminated':
            if (field.fields[field.fields.length - 1].type != 'buffer') {
                field.fields = inquisition(field.fields)
            }
            checked.push(field)
            break
        case 'lengthEncoded': {
                const element = field.fields[field.fields.length - 1]
                if (element.fixed) {
                    const bytes = element.bits / 8
                    checked.push({
                        type: 'checkpoint',
                        lengths: [ `${bytes} * $I[${$I}]` ],
                        vivify: null,
                        rewind: 0
                    })
                } else {
                    field.fields = inquisition(field.fields, $I + 1)
                }
                checked.push(field)
            }
            break
        case 'lengthEncoding':
            checked.push({
                type: 'checkpoint',
                lengths: [ field.body.encoding[0].bits / 8 ],
                vivify: null,
                rewind: 0
            })
            checked.push(field)
            break
        case 'literal':
        case 'bigint':
        case 'integer':
            checked.push({
                type: 'checkpoint',
                lengths: [ field.bits / 8 ],
                vivify: null,
                rewind: 0
            })
            checked.push(field)
            break
        case 'buffer':
        case 'absent':
            checked.push(field)
            break
        default:
            throw new Error(field.type)
        }
    }
    return checked
}

function generate (packet, { require, bff, chk }) {
    let $i = -1, $I = -1, $step = 1, $sip = -1

    const { variables, accumulators, parameters } = declare(packet)

    const inliner = Inliner({
        variables, accumulators, parameters, packet,
        direction: 'parse'
    })

    function signature () {
        const signatories = {
            packet: packet.name,
            parameters: '{}',
            step: $step,
            i: '$i',
            I: '$I',
            sip: '$sip',
            accumulator: '$accumulator',
            starts: '$starts'
        }
        if (Object.keys(parameters).length != 0) {
            const properties = []
            for (const parameter in parameters) {
                properties.push(`${parameter}: ${parameters[parameter]}`)
            }
            signatories.parameters = $(`
                {
                    `, properties.join(', '), `
                }
            `)
        }
        return Object.keys(signatories)
                     .filter(key => variables[key])
                     .map(key => signatories[key])
    }

    function checkpoint (checkpoint, depth) {
        if (checkpoint.lengths.length == 0) {
            return null
        }
        if (checkpoint.rewind != 0) {
            return $(`
                if ($end - ($start - ${checkpoint.rewind}) < ${checkpoint.lengths.join(' + ')}) {
                    return parsers.inc.${packet.name}(`, signature().join(', '), `)($buffer, $start - ${checkpoint.rewind}, $end)
                }
            `)
        }
        return $(`
            if ($end - $start < ${checkpoint.lengths.join(' + ')}) {
                return parsers.inc.${packet.name}(`, signature().join(', '), `)($buffer, $start, $end)
            }
        `)
    }

    function absent (path, field) {
        $step++
        return `${path} = ${util.inspect(field.value)}`
    }
    //

    // Assign an integer value to a member of the parsed object. This is the
    // generated source common to `number` and `BigInt`. First read the bits
    // from the underlying byte buffer, then transform the value if it is a
    // lookup value, packed integer or two's compliment.
    function read (path, field, read) {
        if (homogeneous(field)) {
            $step += 2
        } else {
            $step += 1 + field.bytes.length
        }
        const variable = field.lookup || field.fields || field.compliment ? '$_' : path
        const parse = $(`
            ${variable} `, read, `
        `)
        if (field.fields) {
            return $(`
                `, parse, `

                `, unpack(inliner, packet, path, field, '$_'), `
            `)
        } else if (field.lookup) {
            if (Array.isArray(field.lookup.values)) {
                return $(`
                    `, parse, `

                    ${path} = $lookup[${field.lookup.index}][$_]
                `)
            }
            return $(`
                `, parse, `

                ${path} = $lookup[${field.lookup.index}].forward[$_]
            `)
        }
        if (field.compliment) {
            variables.register = true
            return $(`
                `, parse, `
                ${path} = ${unsign(variable, field.bits)}
            `)
        }

        return parse
    }
    //

    // Read a `number` from the underlying buffer. Will create a standard
    // JavaScript `number` in the constructed object.
    function integer (path, field) {
        const reads = []
        for (let i = 0, I = field.bits / 8; i < I; i++) {
            const { shift, upper, mask } = field.bytes[i]
            const bits = '$buffer[$start++]'
            const masked = upper != 0 ? `(${bits} & ${hex(mask)})` : bits
            if (shift == 0n) {
                reads.push(`${masked}`)
            } else {
                reads.push(`${masked} << ${shift}`)
            }
        }
        if (reads.length != 1) {
            return read(path, field, $(`
                = (
                    `,reads.join(' |\n') , `
                ) >>> 0
            `))
        }
        return read(path, field, `= ${reads[0]}`)
    }
    //

    // Read a `BigInt` from the underlying buffer. Will create a `BigInt`
    // variable in the constructed object.
    function bigint (path, field) {
        const reads = []
        for (let i = 0, I = field.bits / 8; i < I; i++) {
            const { shift, upper, mask } = field.bytes[i]
            const bits = `($buffer[$start++])`
            const masked = upper != 0 ? `(${bits} & ${hex(mask)})` : bits
            if (shift == 0n) {
                reads.push(`BigInt${masked}`)
            } else {
                reads.push(`BigInt${masked} << ${shift}n`)
            }
        }
        if (reads.length != 1) {
            return read(path, field, $(`
                =
                    `, reads.join(' |\n'), `
            `))
        }
        return read(path, field, `= ${reads[0]}`)
    }

    function literal (path, field) {
        function write (literal) {
            if (literal.value.length != 0) {
                $step += 2
            }
            if (literal.repeat == 0) {
                return null
            }
            return $(`
                $start += ${(literal.value.length >>> 1) * literal.repeat}
            `)
        }
        return $(`
            `, write(field.before), -1, `

            `, map(dispatch, path, field.fields), `

            `, -1, write(field.after), `
        `)
    }

    function inline (path, field) {
        const inline = inliner.inline(path, field.after)
        if (inline.starts != null) {
            $step++
            variables.starts = true
        }
        return $(`
            `, inline.starts, -1, `

            `, map(dispatch, path, field.fields), `

            `, -1, inline.inlined, `

            `, -1, inliner.pop(), `
        `)
    }

    function accumulator (path, field) {
        $step++
        variables.accumulator = true
        return $(`
            `, inliner.accumulator(field), `

            `, map(dispatch, path, field.fields), `
        `)
    }

    //
    // **Length-encoded arrays**: First first the length of the array as an
    // integer followed by the array elements in a loop.
    //

    // Parse the length of the array into a variable we can pass to an
    // incremental parser during best-foot-forward parsing. We zero the loop
    // index right after reading the length-encoding because if the array
    // elements are fixed width, we're about to preform a best-foot-forward
    // check that will jump to the loop body of an incremental parser.
    function lengthEncoding (path, field) {
        const element = field.body.fields[field.body.fields.length - 1]
        variables.i = true
        variables.I = true
        const I = `$I[${++$I}]`
        if (element.type == 'buffer') {
            return map(dispatch, I, field.body.encoding)
        }
        return $(`
            `, map(dispatch, I, field.body.encoding), `
            $i[${++$i}] = 0
        `)
    }

    function lengthEncoded (path, field) {
        const element = field.fields[field.fields.length - 1]
        const I = `$I[${$I}]`
        if (element.type == 'buffer') {
            $step++
            $I--
            // Slice the buffer straight out of the parsed buffer. Wrap it in an
            // array if the buffers are chunked.
            return element.concat ? $(`
                ${path} = $buffer.slice($start, $start + ${I})
                $start += ${I}
            `) : $(`
                ${path} = [ $buffer.slice($start, $start + ${I}) ]
                $start += ${I}
            `)
        }
        // Loop overt the elements in an array running byte-by-byte parsers to
        // create each element. Indices can be passed to an incremental during
        // best-foot-forward parsing.
        const i = `$i[${$i}]`
        // Step to skip incremental parser's vivification of the array element.
        $step++
        const source = $(`
            for (; ${i} < ${I}; ${i}++) {
                `, vivify.assignment(`${path}[${i}]`, field), -1, `

                `, map(dispatch, `${path}[${i}]`, field.fields), `
            }
        `)
        $i--
        $I--
        return source
    }

    function terminated (path, field) {
        const element = field.fields.slice().pop().fields.slice().pop()
        if (element.type == 'buffer') {
            const terminator = field.terminator
            const assign = element.concat
                ? `${path} = $buffer.slice($start, $_)`
                : `${path} = [ $buffer.slice($start, $_) ]`
            if (bff || chk) {
                const source = $(`
                    $_ = $buffer.indexOf(Buffer.from(${util.inspect(terminator)}), $start)
                    if (~$_) {
                        `, assign, `
                        $start = $_ + ${terminator.length}
                    } else {
                        return parsers.inc.${packet.name}(${signature().join(', ')})($buffer, $start, $end)
                    }
                `)
                $step += 2 + terminator.length
                return source
            }
            // TODO What if you don't find? Here we create zero buffer.
            return $(`
                $_ = $buffer.indexOf(Buffer.from(${util.inspect(terminator)}), $start)
                $_ = ~$_ ? $_ : $start
                `, assign, `
                $start = $_ + ${terminator.length}
            `)
        }
        $step++
        variables.i = true
        $i++
        const looped = map(dispatch, path, field.fields)
        $step++
        if (false && vivified != null) {
            $step++
        }
        const source = $(`
            $i[${$i}] = 0
            for (;;) {
                `, looped, `
            }
        `)
        $i--
        return source
    }

    function repeated (path, field) {
        const i = `$i[${$i}]`
        const looped = map(dispatch, `${path}[${i}]`, field.fields)
        const vivified = vivify.assignment(path + `[${i}]`, field)
        if (vivified != null) {
            $step++
        }
        return $(`
            `, vivified, -1, `

            `, looped, `

            ${i}++
        `)
    }

    function terminator (field) {
        $step += field.body.terminator.length + 1
        // TODO We really do not want to go beyond the end of the buffer in a
        // whole parser and loop forever, so we still need the checkpoints. The
        // same goes for length encoded. We don't want a malformed packet to
        // cause an enormous loop. Checkpoints for loops only?
        //
        // TODO The above is for documentation. You can have the essence of a
        // serializer, but you should always use a best-foot-forward parser to
        // guard against evil coming in from the outside.
        //
        // TODO When the type is integer and the same size as the terminator
        // lets create an integer sentry.
        //
        // TODO No, it's simple really. We don't need checked whole serializers,
        // but all parsers should be checked somehow. You don't have to worry
        // about running forever, because you can limit the file size, buffer
        // size. Perhaps we have upper limits on arrays, sure. Add that to the
        // langauge somehow, but we shouldn't have unchecked parsers. We use the
        // `bff` logic and return an error if it doesn't fit.
        const terminator = field.body.terminator.map((bite, index) => {
            if (index == 0) {
                return `$buffer[$start] == 0x${bite.toString(16)}`
            } else {
                return `$buffer[$start + ${index}] == 0x${bite.toString(16)}`
            }
        })

        return $(`
            if (
                `, terminator.join(' &&\n'), `
            ) {
                $start += ${terminator.length}
                break
            }
        `)
    }

    function calculation (path, { field }) {
        return $(`
            $I[${++$I}] = `, inliner.test(path, field.length), `
        `)
    }

    function fixed (path, field) {
        const length = field.calculated ? `$I[${$I}]` : field.length
        // Fetch the type of element.
        const element = field.fields[field.fields.length - 1]
        //

        // Buffers can use `indexOf`, `fill` and `copy` and will be much faster
        // than operating byte-by-byte.

        //
        if (element.type == 'buffer') {
            variables.register = true
            variables.slice = true
            // Advance past buffer read to padding skip.
            $step += field.pad.length == 0 ? 2 : 3
            if (field.calculated) {
                $I--
            }
            const slice = $(`
                $slice = $buffer.slice($start, $start + ${length})
                $start += ${length}
            `)
            const assign = element.concat ? `${path} = $slice` : `${path} = [ $slice ]`
            if (field.pad.length != 0) {
                $step += field.pad.length
                const pad = field.pad.length > 1
                    ? `Buffer.from(${util.format(field.pad)})`
                    : field.pad[0]
                return ($(`
                    `, slice, `

                    $_ = $slice.indexOf(${pad})
                    if (~$_) {
                        $slice = $slice.slice(0, $_)
                    }

                    `, assign, `
                `))
            }
            // See: https://marcradziwill.com/blog/mastering-javascript-high-performance/
            return ($(`
                `, slice, `
                `, assign, `
            `))
        }
        variables.i = true
        const i = `$i[${++$i}]`
        $step += 1
        const check = bff && field.pad.length != 0
                    ? checkpoint({ lengths: [ field.pad.length ], rewind: 0 })
                    : null
        // Advance past initialization and terminator tests.
        $step += 1 + field.pad.length
        const looped = map(dispatch, path + `[${i}]`, field.fields)
        // Advance past end-of-loop test and fill skip.
        const vivified = vivify.assignment(`${path}[${i}]`, field)
        if (vivified != null) {
            $step++
        }
        $step += (field.pad.length != 0 ? 2 : 0)
        const terminator = field.pad.map((bite, index) => {
            if (index == 0) {
                return `$buffer[$start] == ${hex(bite)}`
            } else {
                return `$buffer[$start + ${index}] == ${hex(bite)}`
            }
        })
        const terminate = terminator.length != 0
                        ? $(`
                            if (
                                `, terminator.join(' &&\n'), `
                            ) {
                                $start += ${terminator.length}
                                break
                            }
                        `)
                        : null
        let source = null
        if (field.calculated) {
            source = $(`
                ${i} = 0
                do {
                    `, check, -1, `

                    `, terminate, -1, `

                    `, vivify.assignment(`${path}[${i}]`, field), -1, `

                    `, looped, `
                } while (++${i} != ${length})
            `)
            $I--
        } else {
            source = $(`
                ${i} = 0
                do {
                    `, check, -1, `

                    `, terminate, -1, `

                    `, vivify.assignment(`${path}[${i}]`, field), -1, `

                    `, looped, `
                } while (++${i} != ${length})
            `)
        }
        $i--
        if (terminator.length) {
            const element = field.fields[field.fields.length - 1]
            return $(`
                `, source, `

                $start += ${length} != ${i}
                        ? (${length} - ${i}) * ${element.bits >>> 3} - ${field.pad.length}
                        : 0
            `)
        }
        return source
    }

    function rewind (field) {
        return $(`
            $start -= ${field.bytes}
        `)
    }

    function switched (path, field) {
        $step++
        const cases = []
        for (const when of field.cases) {
            const vivified = vivify.assignment(path, when)
            cases.push($(`
                ${when.otherwise ? 'default' : `case ${JSON.stringify(when.value)}`}:
                    `, vivified, -1, `

                    `, map(dispatch, path, when.fields), `

                    break
            `))
        }
        const invocations = inliner.accumulations([ field.select ])
        const test = inliner.test(path, field.select)
        const select = field.stringify ? `String(${test})` : test
        return $(`
            `, invocations, -1, `

            switch (`, select, `) {
            `, join(cases), `
            }
        `)
    }

    function conditional (path, field, rewound = 0) {
        const tests = field.parse.conditions.filter(condition => condition.test != null)
                                             .map(condition => condition.test)
        const invocations = inliner.accumulations(tests)
        const signature = []
        const sip = function () {
            if (field.parse.sip == null) {
                return null
            }
            // TODO Decrement `$sip[]`.
            const sip = `$sip[${++$sip}]`
            signature.push(sip)
            return map(dispatch, sip, field.parse.sip)
        } ()
        $step++
        let ladder = '', keywords = 'if'
        for (let i = 0, I = field.parse.conditions.length; i < I; i++) {
            const condition = field.parse.conditions[i]
            const rewind = function () {
                if (field.parse.sip == null) {
                    return null
                }
                const sip = field.parse.sip[field.parse.sip.length - 1]
                let sipped = sip.bits / 8
                LITERALS: for (let j = 0, J = condition.fields.length; sipped != 0 && j < J; j++) {
                    switch (condition.fields[j].type) {
                    case 'literal':
                        const before = condition.fields[j].before
                        let advance = Math.min(sipped, before.value.length / 2 * before.repeat)
                        sipped -= advance
                        if (advance >= before.value.length / 2) {
                            const remove = Math.floor(advance / (before.value.length / 2))
                            advance -= remove
                            before.repeat -= remove
                        }
                        if (advance != 0) {
                            before.splice(0, advance * 2)
                        }
                        break
                    case 'absent':
                    case 'checkpoint':
                        break
                    default:
                        break LITERALS
                    }
                }
                const checkpoint = condition.fields[0].type == 'checkpoint'
                if (sipped != 0) {
                    condition.fields.splice(checkpoint ? 1 : 0, 0, {
                        type: 'rewind', bytes: sipped + rewound
                    })
                }
                if (checkpoint) {
                    condition.fields[0].rewind = sip.bits / 8 + rewound
                }
            } ()
            const vivified = vivify.assignment(path, condition)
            let source = null
            if (condition.fields[condition.fields.length - 1].type == 'parse') {
                const parse = condition.fields.pop()
                const rewind = condition.fields.pop()
                source = conditional(path, { parse }, rewind.bytes)
            } else {
                source = map(dispatch, path, condition.fields)
            }
            ladder = condition.test != null ? $(`
                `, ladder, `${keywords} (`, inliner.test(path, condition.test, signature), `) {
                    `, vivified, -1, `

                    `, source, `
                }
            `) : $(`
                `, ladder, ` else {
                    `, vivified, -1, `

                    `, source, `
                }
            `)
            keywords = ' else if'
        }
        return $(`
            `, invocations, -1, `

            `, sip, -1, `

            `, ladder, `
        `)
    }

    function dispatch (path, field, root = false) {
        switch (field.type) {
        case 'structure':
            return map(dispatch, path, field.fields)
        case 'conditional':
            return conditional(path, field)
        case 'switch':
            return switched(path, field)
        case 'rewind':
            return rewind(field)
        case 'fixed':
            return fixed(path, field)
        case 'calculation':
            return calculation(path, field)
        case 'terminator':
            return terminator(field)
        case 'repeated':
            return repeated(path, field)
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
            throw new Error(field.type)
        }
    }

    function generate () {
        if (chk) {
            packet.fields = inquisition(packet.fields)
        } else if (bff) {
            packet.fields = checkpoints(packet.name, packet.fields)
        }

        const source = dispatch(packet.name, packet, true)
        const declarations = {
            register: '$_',
            i: '$i = []',
            I: '$I = []',
            sip: '$sip = []',
            slice: '$slice = null',
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

        if (bff || chk) {
            return $(`
                parsers.${bff ? 'bff' : 'chk'}.${packet.name} = function () {
                    `, requires, -1, `

                    return function (`, signature.join(','), `) {
                        return function ($buffer, $start, $end) {
                            `, lets.length ? `let ${lets.join(', ')}` : null, -1, `

                            `, vivify.structure(`let ${packet.name}`, packet), `

                            `, source, `

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            `)
        }

        signature.unshift('$buffer', '$start')
        return $(`
            parsers.all.${packet.name} = function () {
                `, requires, -1, `

                return function (`, signature.join(', '), `) {
                    `, lets.length ? `let ${lets.join(', ')}` : null, -1, `

                    `, 'let ' + vivify.structure(packet.name, packet), `

                    `, source, `

                    return ${packet.name}
                }
            } ()
        `)
    }

    return generate()
}

module.exports = function (definition, options = {}) {
    const expanded = expand(JSON.parse(JSON.stringify(definition)))
    return join(expanded.map(packet => generate(packet, options)))
}
