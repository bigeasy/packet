const join = require('./join')
const snuggle = require('./snuggle')
const pack = require('./pack')
const $ = require('programmatic')

function bff (path, fields, index = 0, rewind = 0) {
    let checkpoint
    const checked = [ checkpoint = { type: 'checkpoint', lengths: [ 0 ], rewind } ]
    for (const field of fields) {
        switch (field.type) {
        case 'conditional':
            for (const condition of field.serialize.conditions) {
                condition.fields = bff(path, condition.fields, index, rewind)
            }
            break
        case 'lengthEncoding':
            checkpoint.lengths[0] += field.bits / 8
            break
        case 'lengthEncoded':
            switch (field.element.type) {
            case 'structure':
                if (field.element.fixed) {
                    checkpoint.lengths.push(`${field.element.bits / 8} * ${path + field.dotted}.length`)
                } else {
                    field.element.fields = bff(path + `${field.dotted}[$i[${index}]]`, field.element.fields, index + 1, 2)
                }
                break
            default:
                checkpoint.lengths.push(`${field.element.bits / 8} * ${path + field.dotted}.length`)
                break
            }
            break
        default:
            checkpoint.lengths[0] += field.bits / 8
            break
        }
        checked.push(field)
    }
    return checked
}

function generate (packet, bff) {
    let step = 0, index = -1, _packed = false

    function word (asignee, field) {
        const bytes = field.bits / 8
        let bite = field.endianness == 'little' ? 0 : bytes - 1
        const stop = field.endianness == 'little' ? bytes : -1
        const direction = field.endianness == 'little' ? 1 : -1
        const shifts = []
        while (bite != stop) {
            const shift = bite ? asignee + ' >>> ' + bite * 8 : asignee
            shifts.push(`$buffer[$start++] = ${shift} & 0xff`)
            bite += direction
        }
        return shifts.join('\n')
    }

    function integer (path, field) {
        step += 2
        if (field.fields) {
            _packed = true
            const packing = pack(field, path, '$_')
            return $(`
                `, packing, `

                `, word('$_', field), `
            `)
        } else {
            return word(path, field)
        }
    }

    function lengthEncoded (path, field) {
        step += 2
        const i = `$i[${++index}]`
        // TODO Here and in conditional we see that we know the name, but we
        // don't know really understand the contents of the packet, so we ought
        // to create the path with `concat` rather than have the packet
        // generation code create the full path with the packet name.
        const looped = dispatch(path + `[${i}]`, field.element)
        const source = $(`
            for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                `, looped, `
            }
        `)
        index--
        return source
    }

    function lengthEncoding (path, field) {
        step += 2
        return word(path + '.length', field)
    }

    function conditional (path, conditional) {
        const block = []
        step++
        for (let i = 0, I = conditional.serialize.conditions.length; i < I; i++) {
            const condition = conditional.serialize.conditions[i]
            const source = join(condition.fields.map(field => dispatch(path, field)))
            const keyword = typeof condition.source == 'boolean' ? 'else'
                                                               : i == 0 ? 'if' : 'else if'
            const ifed = $(`
                ${keyword} ((${condition.source})(${path}, ${packet.name})) {
                    `, source, `
                }
            `)
            block.push(ifed)
        }
        return snuggle(block)
    }

    function checkpoint (checkpoint) {
        const i = packet.lengthEncoded ? '$i' : '[]'
        return $(`
            if ($end - $start < ${checkpoint.lengths.join(' + ')}) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(${packet.name}, ${step - checkpoint.rewind}, ${i})
                }
            }
        `)
    }

    function dispatch (path, field) {
        switch (field.type) {
        case 'structure':
            return join(field.fields.map(field => dispatch(path + field.dotted, field)))
        case 'checkpoint':
            return checkpoint(field)
        case 'conditional':
            return conditional(path, field)
        case 'lengthEncoding':
            return lengthEncoding(path, field)
        case 'lengthEncoded':
            return lengthEncoded(path, field)
        case 'buffer':
            return buffer(field)
        case 'integer':
            return integer(path, field)
        case 'literal':
            return $(`
                $buffer.write(${JSON.stringify(field.value)}, $start, $start + ${field.value.length / 2}, 'hex')
                $start += ${field.value.length / 2}
            `)
        default:
            throw new Error
        }
    }

    let source = dispatch(packet.name, packet)
    const lets = []
    if (packet.lengthEncoded) {
        lets.push('$i = []')
    }
    if (_packed) {
        lets.push('$_')
    }
    return $(`
        serializers.${bff ? 'bff' : 'all'}.${packet.name} = function (${packet.name}) {
            return function ($buffer, $start, $end) {
                `, lets.length != 0 ? `let ${lets.join(', ')}` : null, -1, `

                `, source, `

                return { start: $start, serialize: null }
            }
        }
    `)
}

module.exports = function (compiler, definition, options = {}) {
    const source = join(JSON.parse(JSON.stringify(definition)).map(function (packet) {
        if (options.bff) {
            packet.fields = bff(packet.name, packet.fields)
        }
        return generate(packet, options.bff)
    }))
    return compiler(source)
}
