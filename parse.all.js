const join = require('./join')
const snuggle = require('./snuggle')
const unpack = require('./unpack')
const unsign = require('./fiddle/unsign')
const $ = require('programmatic')
const vivify = require('./vivify')
const ARRAYED = [ 'lengthEncoding', 'terminated' ]

function map (packet, bff) {
    let $i = -1, $sip = -1, $step = 1

    const variables = { packet: true, step: true }

    // TODO You can certianly do something to make this prettier.
    // TODO Start by prepending the path I think?
    function checkpoints (path, fields, index = 0, rewind = 0) {
        let checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind }, checked = [ checkpoint ]
        for (const field of fields) {
            switch (field.type) {
            case 'function':
                break
            case 'conditional':
                variables.sip = true
                field.parse.sip = checkpoints(path, field.parse.sip, index, rewind)
                for (const condition of field.parse.conditions) {
                    condition.fields = checkpoints(path, condition.fields, index, rewind)
                }
                break
            case 'lengthEncoding':
                checkpoint.lengths[0] += field.bits / 8
                break
            case 'lengthEncoded':
                variables.i = true
                variables.I = true
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind: 0 })
                switch (field.element.type) {
                case 'structure':
                    if (field.element.fixed) {
                        checkpoint.lengths.push(`${field.element.bits / 8} * $I[${index}]`)
                    } else {
                        field.element.fields = checkpoints(path + `${field.dotted}[$i[${index}]]`, field.element.fields, index + 1)
                    }
                    break
                default:
                    checkpoint.lengths.push(`${field.element.bits / 8} * $I[${index}]`)
                    break
                }
                break
            case 'terminated':
                // TODO I have notes on termination improvements in the Redux
                // diary.
                variables.i = true
                field.fields = checkpoints(path + `${field.dotted}[$i[${index}]]`, field.fields, index + 1)
                checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind: 0 })
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
        const variable = field.fields || field.compliment ? '$_' : assignee
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

                `, unpack(assignee, field, '$_'), `
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

    function lengthEncoded (path, field) {
        variables.i = true
        variables.I = true
        $step += 1
        const i = `$i[${$i}]`
        const I = `$I[${$i}]`
        const looped = dispatch(path + `[${i}]`, field.element)
        $i--
        return $(`
            for (; ${i} < ${I}; ${i}++) {
                `, looped, `
            }
        `)
    }

    function lengthEncoding (field) {
        $i++
        return $(`
            $i[${$i}] = 0
            `, integer(`$I[${$i}]`, field), `
        `)
    }

    function terminated (path, field) {
        variables.i = true
        $i++
        const i = `$i[${$i}]`
        $step += 1
        const check = bff ? checkpoint({
            lengths: [ field.terminator.length ], rewind: 0
        }) : null
        $step += field.terminator.length
        const looped = join(field.fields.map(field => dispatch(path + `[${i}]`, field)))
        $step += field.terminator.length
        // TODO We really do not want to go beyond the end of the buffer in a
        // whole parser and loop forever, so we still need the checkpoints. The
        // same goes for length encoded. We don't want a malformed packet to
        // cause an enormous loop. Checkpoints for loops only?
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
        const vivify = ~ARRAYED.indexOf(field.fields[0].type) ? `${path}[${i}] = []` : null
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

                `, vivify, -1, `

                `, looped, `
                ${i}++
            }
        `)
        $i--
        return source
    }

    function conditional (path, conditional) {
        $sip++
        const block = []
        variables.sip = true
        const sip = join(conditional.parse.sip.map(field => dispatch(`$sip[${$sip}]`, field)))
        $step++
        for (let i = 0, I = conditional.parse.conditions.length; i < I; i++) {
            const condition = conditional.parse.conditions[i]
            const source = join(condition.fields.map(field => dispatch(path, field)))
            const keyword = typeof condition.source == 'boolean' ? 'else'
                                                               : i == 0 ? 'if' : 'else if'
            const ifed = $(`
                ${keyword} ((${condition.source})($sip[${$sip}], ${packet.name})) {
                    `, source, `
                }
            `)
            block.push(ifed)
        }
        $sip--
        return $(`
            `, sip, `

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
                return $(`
                    ${root ? `const ${path}` : path} = {
                        `, vivify(field.fields), `
                    }

                    `, join(field.fields.map(field => dispatch(path + field.dotted, field))), `
                `)
            }
        case 'checkpoint':
            return checkpoint(field)
        case 'conditional':
            return conditional(path, field)
        case 'terminated':
            return terminated(path, field)
        case 'lengthEncoding':
            return lengthEncoding(field)
        case 'lengthEncoded':
            return lengthEncoded(path, field)
        case 'function':
            $step++
            return `${path} = (${field.source})($sip[${$sip}])`
        case 'literal':
            return $(`
                $start += ${field.value.length / 2}
            `)
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
    if (bff) {
        return $(`
            parsers.bff.${packet.name} = function () {
                return function parse ($buffer, $start, $end) {
                    `, lets.length ? `let ${lets.join(', ')}` : null, -1, `

                    `, source, `

                    return { start: $start, object: object, parse: null }
                }
            }
        `)
    }

    return $(`
        parsers.all.${packet.name} = function ($buffer, $start) {
            `, lets.length ? `let ${lets.join(', ')}` : null, -1, `

            `, source, `

            return ${packet.name}
        }
    `)
}

module.exports = function (compiler, definition, options = {}) {
    return compiler(join(JSON.parse(JSON.stringify(definition)).map(packet => map(packet, options.bff))))
}
