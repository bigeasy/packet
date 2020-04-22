const join = require('./join')
const snuggle = require('./snuggle')
const unpack = require('./unpack')
const $ = require('programmatic')
const vivify = require('./vivify')

function bff (path, fields, index = 0, rewind = 0) {
    let checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind }, checked = [ checkpoint ]
    for (const field of fields) {
        switch (field.type) {
        case 'function':
            break
        case 'conditional':
            field.parse.sip = bff(path, field.parse.sip, index, rewind)
            for (const condition of field.parse.conditions) {
                condition.fields = bff(path, condition.fields, index, rewind)
            }
            break
        case 'lengthEncoding':
            checkpoint.lengths[0] += field.bits / 8
            break
        case 'lengthEncoded':
            checked.push(checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind: 0 })
            switch (field.element.type) {
            case 'structure':
                if (field.element.fixed) {
                    checkpoint.lengths.push(`${field.element.bits / 8} * $I[${index}]`)
                } else {
                    field.element.fields = bff(path + `${field.dotted}[$i[${index}]]`, field.element.fields, index + 1, 2)
                }
                break
            default:
                checkpoint.lengths.push(`${field.element.bits / 8} * $I[${index}]`)
                break
            }
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

function map (packet, bff) {
    let $i = -1, $sip = -1, step = 1, _conditional = false, _packed = false

    function integer (assignee, field) {
        const variable = field.fields ? '$_' : assignee
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
        step += 2
        const parse = bytes == 1 ? `${variable} = ${reads.join('')}`
                                 : $(`
                                        ${variable} =
                                            `, reads.reverse().join(' +\n'), `
                                    `)
        if (field.fields) {
            _packed = true
            return $(`
                `, parse, `

                `, unpack(assignee, field, '$_'), `
            `)
        }

        return parse
    }

    function lengthEncoded (path, field) {
        step += 1
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

    function conditional (path, conditional) {
        $sip++
        const block = []
        _conditional = true
        const sip = join(conditional.parse.sip.map(field => dispatch(`$sip[${$sip}]`, field)))
        step++
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
        const signature = [ packet.name, step ]
        if (checkpoint.lengths.length == 0) {
            return null
        }
        if (packet.lengthEncoded) {
            signature.push('$i', '$I')
        }
        if (_conditional) {
            signature.push('$sip')
        }
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
        case 'lengthEncoding':
            return lengthEncoding(field)
        case 'lengthEncoded':
            return lengthEncoded(path, field)
        case 'function':
            step++
            return `${path} = (${field.source})($sip[${$sip}])`
        case 'literal':
            return $(`
                $start += ${field.value.length / 2}
            `)
        default:
            return integer(path, field)
        }
    }

    const source = dispatch(packet.name, packet, true)
    const variables = []
    if (packet.lengthEncoded) {
        variables.push('$i = []', '$I = []')
    }
    if (_conditional) {
        variables.push('$sip = []')
    }
    if (_packed) {
        variables.push('$_')
    }

    if (bff) {
        return $(`
            parsers.bff.${packet.name} = function () {
                return function parse ($buffer, $start, $end) {
                    `, variables.length ? `let ${variables.join(', ')}` : null, -1, `

                    `, source, `

                    return { start: $start, object: object, parse: null }
                }
            }
        `)
    }

    return $(`
        parsers.all.${packet.name} = function ($buffer, $start) {
            `, variables.length ? `let ${variables.join(', ')}` : null, -1, `

            `, source, `

            return ${packet.name}
        }
    `)
}

module.exports = function (compiler, definition, options = {}) {
    const source = join(JSON.parse(JSON.stringify(definition)).map(function (packet) {
        if (options.bff) {
            packet.fields = bff(packet.name, packet.fields)
        }
        return map(packet, options.bff)
    }))
    return compiler(source)
}
