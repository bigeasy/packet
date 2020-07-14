// Node.js API.
const util = require('util')

// Format source code maintaining indentation.
const $ = require('programmatic')

// Generate literal object construction.
const vivify = require('./vivify')

// Generate two's compliment conversion.
const unsign = require('./fiddle/unsign')

// Generate integer unpacking.
const unpack = require('./unpack')

// Determine necessary variables.
const { parse: declare } = require('./declare')

// Maintain a set of lookup constants.
const lookup = require('./lookup')

// Generate accumulator declaration source.
const accumulatorer = require('./accumulator')

// Generate inline function source.
const inliner = require('./inliner')

// Generate required modules and functions.
const required = require('./required')

const map = require('./map')

// Format source code maintaining indentation.
const join = require('./join')

// Join an array of strings with first line of subsequent element catenated to
// last line of previous element.
const snuggle = require('./snuggle')

function expand (fields) {
    const expanded = []
    for (const field of fields) {
        switch (field.type) {
        case 'lengthEncoded':
            field.fields = expand(field.fields)
            expanded.push({ type: 'lengthEncoding', body: field, vivify: null })
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
        case 'fixed':
        case 'inline':
        case 'accumulator':
        case 'structure':
            field.fields = expand(field.fields)
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
        default:
            expanded.push(field)
            break
        }
    }
    return expanded
}

function generate (packet, { require, bff }) {
    let $i = -1, $I = -1, $step = 1

    const variables = declare(packet)

    const accumulate = {
        accumulator: {},
        accumulated: [],
        buffered: [],
        variables: variables,
        packet: packet.name,
        direction: 'parse'
    }

    const $lookup = {}

    // TODO You can certianly do something to make this prettier.
    // TODO Start by prepending the path I think?
    function checkpoints (path, fields, index = 0) {
        let checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind: 0 }, checked = [ checkpoint ]
        for (const field of fields) {
            switch (field.type) {
            case 'function':
                checked.push(field)
                break
            case 'switch':
                checked.push(field)
                for (const when of field.cases) {
                    when.fields = checkpoints(path, when.fields, index)
                }
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind: 0 })
                break
            case 'conditional':
                checked.push(field)
                // TODO Sip belongs outside since it is generally a byte or so.
                if (field.parse.sip != null) {
                    field.parse.sip = checkpoints(path, field.parse.sip, index)
                }
                for (const condition of field.parse.conditions) {
                    condition.fields = checkpoints(path, condition.fields, index)
                }
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind: 0 })
                break
            case 'lengthEncoding':
                checked.push(field)
                checkpoint.lengths[0] += field.body.encoding[0].bits / 8
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind: 0 })
                break
            case 'lengthEncoded':
                checked.push(field)
                if (field.fields[0].fixed) {
                    // Tricky, stick the checkpoint for a fixed array at the end
                    // of the encoding fields. Let any subsequent fields use the
                    // checkpoint.
                    checkpoint.lengths.push(`${field.fields[0].bits / 8} * $I[${index}]`)
                } else {
                    field.fields = checkpoints(path + `${field.dotted}[$i[${index}]]`, field.fields, index + 1)
                    checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind: 0 })
                }
                break
            case 'terminator':
                checked.push(field)
                checkpoint.lengths[0] += field.body.terminator.length
                break
            case 'repeated':
                // TODO If the terminator is greater than or equal to the size
                // of the repeated part, we do not have to perform the
                // checkpoint.
                checked.push(field)
                field.fields = checkpoints(path, field.fields, index + 1)
                break
            case 'terminated':
                checked.push(field)
                field.fields = checkpoints(path + `${field.dotted}[$i[${index}]]`, field.fields, index + 1)
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind: 0 })
                break
            case 'inline':
            case 'accumulator':
            case 'structure':
                checked.push(field)
                if (field.fixed) {
                    checkpoint.lengths[0] += field.bits / 8
                } else {
                    // TODO Could start from the nested checkpoint since we are
                    // are not actually looping for the structure.
                    field.fields = checkpoints(path + field.dotted, field.fields, index)
                    checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind: 0 })
                }
                break
            default:
                checked.push(field)
                checkpoint.lengths[0] += field.bits / 8
                break
            }
        }
        checked.forEach(field => {
            if (field.type == 'checkpoint' && field.lengths[0] == 0) {
                field.lengths.shift()
            }
        })
        return checked.filter(field => {
            return field.type != 'checkpoint' || field.lengths.length != 0
        })
    }

    function absent (path, field) {
        $step++
        return `${path} = ${util.inspect(field.value)}`
    }

    function integer (assignee, field) {
        const variable = field.lookup || field.fields || field.compliment ? '$_' : assignee
        const bytes = field.bits / 8
        let bite = field.endianness == 'little' ? 0 : bytes - 1
        const stop = field.endianness == 'little' ? bytes : -1
        const direction = field.endianness == 'little' ? 1 : -1
        const reads = []
        const cast = field.bits > 32
            ? { suffix: 'n', to: 'BigInt' }
            : { suffix: '', to: '' }
        while (bite != stop) {
            reads.unshift(`${cast.to}($buffer[$start++])`)
            if (bite) {
                reads[0] += ` * 0x${(256n ** BigInt(bite)).toString(16)}${cast.suffix}`
            }
            bite += direction
        }
        $step += 2
        const parse = bytes == 1 ? `${variable} = ${reads.join('')}`
                                 : $(`
                                        ${variable} =
                                            `, reads.reverse().join(' +\n'), `
                                    `)
        if (field.fields) {
            return $(`
                `, parse, `

                `, unpack(packet, assignee, field, '$_'), `
            `)
        } else if (field.lookup) {
            lookup($lookup, assignee, field.lookup.slice())
            return $(`
                `, parse, `

                ${assignee} = $lookup.${assignee}[$_]
            `)
        }

        if (field.compliment) {
            variables.register = true
            return $(`
                `, parse, `
                ${assignee} = ${unsign(variable, field.bits)}
            `)
        }

        return parse
    }

    function rewind (field) {
        return $(`
            $start -= ${field.bytes}
        `)
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
                $start += ${literal.value.length / 2 * literal.repeat}
            `)
        }
        return $(`
            `, write(field.before), -1, `

            `, map(dispatch, path, field.fields), `

            `, -1, write(field.after), `
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
                `, vivify.array(`${path}[${i}]`, field), -1, `

                `, map(dispatch, `${path}[${i}]`, field.fields), `
            }
        `)
        $i--
        $I--
        return source
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

    function repeated (path, field) {
        const i = `$i[${$i}]`
        const looped = join(field.fields.map(field => dispatch(path + `[${i}]`, field)))
        return $(`
            `, vivify.array(path + `[${i}]`, field), -1, `

            `, looped, `

            ${i}++
        `)
    }

    function terminated (path, field) {
        const element = field.fields.slice().pop().fields.slice().pop()
        if (element.type == 'buffer') {
            const terminator = field.terminator
            if (bff) {
                const source = $(`
                    $_ = $buffer.indexOf(Buffer.from(${util.inspect(terminator)}), $start)
                    if (~$_) {
                        ${path} = $buffer.slice($start, $_)
                        $start = $_ + ${terminator.length}
                    } else {
                        return parsers.inc.${packet.name}(${signature().join(', ')})($buffer, $start, $end)
                    }
                `)
                $step += 2 + terminator.length
                return source
            }
            return $(`
                $_ = $buffer.indexOf(Buffer.from(${util.inspect(terminator)}), $start)
                $_ = ~$_ ? $_ : $start
                ${path} = $buffer.slice($start, $_)
                $start = $_ + ${terminator.length}
            `)
        }
        $step++
        variables.i = true
        $i++
        const looped = join(field.fields.map(field => dispatch(path + field.dotted, field)))
        $step++
        const source = $(`
            $i[${$i}] = 0
            for (;;) {
                `, looped, `
            }
        `)
        $i--
        return source
    }

    function fixed (path, field) {
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
            const slice = $(`
                $slice = $buffer.slice($start, ${field.length})
                $start += ${field.length}
            `)
            const assign = element.concat ? `${path} = $slice` : `${path}.push($slice)`
            if (field.pad.length != 0) {
                $step += field.pad.length
                const pad = field.pad.length > 1
                    ? `Buffer.from(${util.format(field.pad)})`
                    : field.pad[0]
                return ($(`
                    `, slice, `

                    $_ = $slice.indexOf(${pad})
                    if (~$_) {
                        $slice = $buffer.slice(0, $_)
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
                    ? checkpoint({ lengths: [ field.pad.length ] })
                    : null
        // Advance past initialization and terminator tests.
        $step += 1 + field.pad.length
        const looped = join(field.fields.map(field => dispatch(path + `[${i}]`, field)))
        // Advance past end-of-loop test and fill skip.
        $step += 1 + (field.pad.length != 0 ? 2 : 0)
        const terminator = field.pad.map((bite, index) => {
            if (index == 0) {
                return `$buffer[$start] == 0x${bite.toString(16)}`
            } else {
                return `$buffer[$start + ${index}] == 0x${bite.toString(16)}`
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
        const source = $(`
            ${i} = 0
            for (;;) {
                `, check, -1, `

                `, terminate, -1, `

                `, vivify.array(path + `[${i}]`, field), -1, `

                `, looped, `
                ${i}++

                if (${i} == ${field.length}) {
                    break
                }
            }

        `)
        $i--
        if (terminator.length) {
            return $(`
                `, source, `

                $start += ${field.length} != ${i}
                        ? (${field.length} - ${i}) * ${field.bits / field.length / 8} - ${field.pad.length}
                        : 0
            `)
        }
        return source
    }

    function inline (path, field) {
        const after = field.after.length != 0 ? function () {
            const inline = inliner(accumulate, path, field.after, [ path ], path)
            if (inline.buffered.start != inline.buffered.end) {
                $step++
                variables.starts = true
            }
            if (inline.inlined.length == 0) {
                return {
                    source: null,
                    buffered: inline.buffered
                }
            }
            return {
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
        const starts = []
        for (let i = after.buffered.start, I = after.buffered.end; i < I; i++) {
            starts.push(`$starts[${i}] = $start`)
        }
        const source = map(dispatch, path, field.fields)
        const buffered = accumulate.buffered
            .splice(0, after.buffered.end)
            .map(buffered => {
                return buffered.source
            })
        return $(`
            `, starts.length != 0 ? starts.join('\n') : null, -1, `

            `, source, `

            `, -1, after.source, `

            `, -1, buffered.length != 0 ? buffered.join('\n') : null, `
        `)
    }

    function conditional (path, field) {
        const accumulators = {}
        field.parse.conditions.forEach(condition => {
            if (condition.test == null) {
                return
            }
            condition.test.properties.forEach(property => {
                if (accumulate.accumulator[property] != null) {
                    accumulators[property] = true
                }
            })
        })
        const invocations = accumulate.buffered.filter(accumulator => {
            return accumulator.properties.filter(property => {
                return accumulate.accumulator[property] != null
            }).length != 0
        }).map(invocation => {
            return $(`
                `, invocation.source, `
                $starts[${invocation.start}] = $start
            `)
        })
        const signature = []
        const sip = function () {
            if (field.parse.sip == null) {
                return null
            }
            signature.push(`$sip`)
            return join(field.parse.sip.map(field => dispatch(`$sip`, field)))
        } ()
        $step++
        const ladder = []
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
                        type: 'rewind', bytes: sipped
                    })
                }
                if (checkpoint) {
                    condition.fields[0].rewind = sip.bits / 8
                }
            } ()
            const source = join(condition.fields.map(field => dispatch(path, field)))
            if (condition.test != null) {
                const inline = inliner(accumulate, path, [ condition.test ], signature)
                ladder.push(`${i == 0 ? 'if' : 'else if'} (${inline.inlined.shift()})` + $(`
                    {
                        `, source, `
                    }
                `))
            } else {
                ladder.push($(`
                    else {
                        `, source, `
                    }
                `))
            }
        }
        return $(`
            `, invocations.length != 0 ? invocations.join('\n') : null, -1, `

            `, sip, -1, `

            `, snuggle(ladder), `
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
        if (field.stringify) {
            return $(`
                switch (String((${field.source})(${packet.name}))) {
                `, join(cases), `
                }
            `)
        }
        return $(`
            switch ((${field.source})(${packet.name})) {
            `, join(cases), `
            }
        `)
    }

    function accumulator (path, field) {
        $step++
        variables.accumulator = true
        return $(`
            `, accumulatorer(accumulate, field), `

            `, map(dispatch, path, field.fields), `
        `)
    }

    function signature () {
        const signatories = {
            packet: packet.name,
            step: $step,
            i: '$i',
            I: '$I',
            sip: '$sip',
            accumulator: '$accumulator',
            starts: '$starts'
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
                    return parsers.inc.${packet.name}(${signature().join(', ')})($buffer, $start - ${checkpoint.rewind}, $end)
                }
            `)
        }
        return $(`
            if ($end - $start < ${checkpoint.lengths.join(' + ')}) {
                return parsers.inc.${packet.name}(${signature().join(', ')})($buffer, $start, $end)
            }
        `)
    }

    function dispatch (path, field, root = false) {
        switch (field.type) {
        case 'structure': {
                return map(dispatch, path, field.fields)
            }
        case 'checkpoint':
            return checkpoint(field)
        case 'accumulator':
            return accumulator(path, field)
        case 'switch':
            return switched(path, field)
        case 'inline':
            return inline(path, field)
        case 'conditional':
            return conditional(path, field)
        case 'fixed':
            return fixed(path, field)
        case 'repeated':
            return repeated(path, field)
        case 'terminator':
            return terminator(field)
        case 'terminated':
            return terminated(path, field)
        case 'lengthEncoding':
            return lengthEncoding(path, field)
        case 'lengthEncoded':
            return lengthEncoded(path, field)
        case 'rewind':
            return rewind(field)
        case 'literal':
            return literal(path, field)
        case 'integer':
            return integer(path, field)
        case 'absent':
            return absent(path, field)
        default:
            throw new Error(field.type)
        }
    }

    if (bff) {
        packet.fields = checkpoints(packet.name, packet.fields)
    }

    const source = dispatch(packet.name, packet, true)
    const declarations = {
        register: '$_',
        i: '$i = []',
        I: '$I = []',
        sip: '$sip = 0',
        slice: '$slice = null',
        accumulator: '$accumulator = {}',
        starts: '$starts = []'
    }
    const lets = Object.keys(declarations)
                            .filter(key => variables[key])
                            .map(key => declarations[key])
    const lookups = Object.keys($lookup).length != 0
                  ? `const $lookup = ${JSON.stringify($lookup, null, 4)}`
                  : null

    const requires = required(require)

    if (bff) {
        return $(`
            parsers.bff.${packet.name} = function () {
                `, requires, -1, `

                `, lookups, -1, `

                return function () {
                    return function parse ($buffer, $start, $end) {
                        `, lets.length ? `let ${lets.join(', ')}` : null, -1, `

                        `, vivify.structure(`let ${packet.name}`, packet), `

                        `, source, `

                        return { start: $start, object: object, parse: null }
                    }
                } ()
            }
        `)
    }

    return $(`
        parsers.all.${packet.name} = function () {
            `, requires, -1, `

            `, lookups, -1, `

            return function ($buffer, $start) {
                `, lets.length ? `let ${lets.join(', ')}` : null, -1, `

                `, 'let ' + vivify.structure(packet.name, packet), `

                `, source, `

                return ${packet.name}
            }
        } ()
    `)
}

module.exports = function (definition, options = {}) {
    const expanded = expand(JSON.parse(JSON.stringify(definition)))
    return join(expanded.map(packet => generate(packet, options)))
}
