const join = require('./join')
const map = require('./map')
const snuggle = require('./snuggle')
const unpack = require('./unpack')
const unsign = require('./fiddle/unsign')
const $ = require('programmatic')
const corporeal = require('./corporeal')
const vivify = require('./vivify')
const lookup = require('./lookup')

function generate (packet, bff) {
    let $i = -1, $sip = -1, $step = 1

    const variables = { packet: true, step: true }

    const $lookup = {}

    // TODO You can certianly do something to make this prettier.
    // TODO Start by prepending the path I think?
    function checkpoints (path, fields, index = 0) {
        let checkpoint = {
            type: 'checkpoint',
            ethereal: true,
            lengths: [ 0 ]
        }, checked = [ checkpoint ]
        for (const field of fields) {
            switch (field.type) {
            case 'function':
                break
            case 'conditional':
                if (field.parse.sip != null) {
                    variables.sip = true
                    field.parse.sip = checkpoints(path, field.parse.sip, index)
                }
                for (const condition of field.parse.conditions) {
                    condition.fields = checkpoints(path, condition.fields, index)
                }
                break
            case 'lengthEncoded':
                variables.i = true
                variables.I = true
                checkpoint.lengths[0] += field.encoding[0].bits / 8
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
                if (field.fixed) {
                    checkpoint.lengths.push(`${field.element.bits / 8} * $I[${index}]`)
                } else {
                    field.fields = checkpoints(path + `${field.dotted}[$i[${index}]]`, field.fields, index + 1)
                }
                break
            case 'terminated':
                // TODO I have notes on termination improvements in the Redux
                // diary.
                variables.i = true
                field.fields = checkpoints(path + `${field.dotted}[$i[${index}]]`, field.fields, index + 1)
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ] })
                break
            case 'structure':
                field.fields = checkpoints(path + field.dotted, field.fields, index)
                break
            default:
                checkpoint.lengths[0] += field.bits / 8
                break
            }
            checked.push(field)
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

    function integer (assignee, field) {
        const variable = field.lookup || field.fields || field.compliment ? '$_' : assignee
        const bytes = field.bits / 8
        let bite = field.endianness == 'little' ? 0 : bytes - 1
        const stop = field.endianness == 'little' ? bytes : -1
        const direction = field.endianness == 'little' ? 1 : -1
        const reads = []
        while (bite != stop) {
            reads.unshift('$buffer[$start++]')
            if (bite) {
                reads[0] += ' * 0x' + Math.pow(256, bite).toString(16)
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
            variables.register = true
            return $(`
                `, parse, `

                `, unpack(packet, assignee, field, '$_'), `
            `)
        } else if (field.lookup) {
            variables.register = true
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

    function literal (path, field) {
        function write (literal) {
            if (literal.repeat == 0) {
                return null
            }
            return $(`
                $start += ${literal.value.length / 2 * literal.repeat}
            `)
        }
        return $(`
            `, write(field.before), 1, `

            `, map(dispatch, path, field.fields), `

            `, write(field.after), -1, `
        `)
    }

    function lengthEncoded (path, field) {
        variables.i = true
        variables.I = true
        $i++
        const i = `$i[${$i}]`
        const I = `$I[${$i}]`
        const encoding = map(dispatch, `${I}`, field.encoding)
        // Step to skip incremental parser's vivification of the array element.
        $step++
        const source = $(`
            ${i} = 0
            `, encoding, `

            for (; ${i} < ${I}; ${i}++) {
                `, vivify.array(`${path}[${i}]`, field), `

                `, map(dispatch, `${path}[${i}]`, field.fields), `
            }
        `)
        $i--
        return source
    }

    function terminated (path, field) {
        variables.i = true
        const i = `$i[${++$i}]`
        $step += 1
        const check = bff ? checkpoint({ lengths: [ field.terminator.length ] }) : null
        $step += 1
        $step += field.terminator.length
        const looped = join(field.fields.map(field => dispatch(path + `[${i}]`, field)))
        $step += field.terminator.length
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
        const terminator = field.terminator.map((bite, index) => {
            if (index == 0) {
                return `$buffer[$start] == 0x${bite.toString(16)}`
            } else {
                return `$buffer[$start + ${index}] == 0x${bite.toString(16)}`
            }
        })
        const source = $(`
            ${i} = 0
            for (;;) {
                `, check, -1, `

                if (
                    `, terminator.join(' &&\n'), `
                ) {
                    $start += ${terminator.length}
                    break
                }

                `, vivify.array(path + `[${i}]`, field), -1, `

                `, looped, `
                ${i}++
            }
        `)
        $i--
        return source
    }

    function fixed (path, field) {
        variables.i = true
        const i = `$i[${++$i}]`
        $step += 1
        const check = bff && field.pad.length != 0
                    ? checkpoint({ lengths: [ field.pad.length ] })
                    : null
        $step += 1
        $step += field.pad.length
        const looped = join(field.fields.map(field => dispatch(path + `[${i}]`, field)))
        $step += field.pad.length
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

                $start += (${field.length} - ${i}) * ${field.bits / field.length / 8} - ${field.pad.length}
            `)
        }
        return source
    }

    function conditional (path, conditional) {
        const block = []
        const signature = []
        const sip = function () {
            if (conditional.parse.sip == null) {
                return null
            }
            variables.sip = true
            $sip++
            signature.push(`$sip[${$sip}]`)
            return join(conditional.parse.sip.map(field => dispatch(`$sip[${$sip}]`, field)))
        } ()
        signature.push(packet.name)
        $step++
        for (let i = 0, I = conditional.parse.conditions.length; i < I; i++) {
            const condition = conditional.parse.conditions[i]
            const source = join(condition.fields.map(field => dispatch(path, field)))
            const keyword = typeof condition.source == 'boolean' ? 'else'
                                                               : i == 0 ? 'if' : 'else if'
            const ifed = $(`
                ${keyword} ((${condition.source})(${signature.join(', ')})) {
                    `, source, `
                }
            `)
            block.push(ifed)
        }
        if (conditional.parse.sip != null) {
            $sip--
        }
        return $(`
            `, sip, -1, `

            `, snuggle(block), `
        `)
    }

    function checkpoint (checkpoint, depth, arrayed) {
        if (checkpoint.lengths.length == 0) {
            return null
        }
        const signatories = {
            packet: packet.name,
            step: $step,
            i: '$i',
            I: '$I',
            sip: '$sip'
        }
        const signature = Object.keys(signatories)
                                .filter(key => variables[key])
                                .map(key => signatories[key])
        return $(`
            if ($end - $start < ${checkpoint.lengths.join(' + ')}) {
                return parsers.inc.${packet.name}(${signature.join(', ')})($buffer, $start, $end)
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
        case 'conditional':
            return conditional(path, field)
        case 'fixed':
            return fixed(path, field)
        case 'terminated':
            return terminated(path, field)
        case 'lengthEncoded':
            return lengthEncoded(path, field)
        case 'function':
            $step++
            return `${path} = (${field.source})($sip[${$sip}])`
        case 'literal':
            return literal(path, field)
        default:
            return integer(path, field)
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
        sip: '$sip = []'
    }
    const lets = Object.keys(declarations)
                            .filter(key => variables[key])
                            .map(key => declarations[key])
    const lookups = Object.keys($lookup).length != 0
                  ? `const $lookup = ${JSON.stringify($lookup, null, 4)}`
                  : null
    if (bff) {
        return $(`
            parsers.bff.${packet.name} = function () {
                `, lookups, -1, `

                return function parse ($buffer, $start, $end) {
                    `, lets.length ? `let ${lets.join(', ')}` : null, -1, `

                    `, vivify.structure(`const ${packet.name}`, packet), `

                    `, source, `

                    return { start: $start, object: object, parse: null }
                }
            }
        `)
    }

    return $(`
        parsers.all.${packet.name} = function ($buffer, $start) {
            `, lookups, -1, `

            `, lets.length ? `let ${lets.join(', ')}` : null, -1, `

            `, vivify.structure(`const ${packet.name}`, packet), `

            `, source, `

            return ${packet.name}
        }
    `)
}

module.exports = function (compiler, definition, options = {}) {
    return compiler(join(JSON.parse(JSON.stringify(definition)).map(packet => generate(packet, options.bff))))
}
