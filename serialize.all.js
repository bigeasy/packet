const join = require('./join')
const pack = require('./pack')
const $ = require('programmatic')

function bff (path, packet, arrayed) {
    let checkpoint
    const fields = [ checkpoint = { type: 'checkpoint', lengths: [ 0 ] } ]
    for (let i = 0, I = packet.fields.length; i < I; i++) {
        const field = JSON.parse(JSON.stringify(packet.fields[i]))
        switch (field.type) {
        case 'lengthEncoding':
            checkpoint.lengths[0] += field.bits / 8
            break
        case 'lengthEncoded':
            switch (field.element.type) {
            case 'structure':
                field.element.fields = bff(path.concat(packet.name), field.element, true)
                break
            default:
                checkpoint.lengths.push(`${field.element.bits / 8} * ${path.concat(field.name).join('.')}.length`)
                break
            }
            break
        default:
            checkpoint.path = path.concat(packet.name)
            checkpoint.lengths[0] += field.bits / 8
            break
        }
        fields.push(field)
    }
    return fields
}

function generate (packet, bff) {
    let step = 0
    let index = -1
    const constants = {}

    function integer (path, field) {
        step += 2
        if (field.fields) {
            const pack = _pack(field, '$_')
            return $(`
                {
                    `, pack, `

                    `, word(field, 'value'), `
                }
            `)
        } else {
            return $(`
                $_ = ${path}.${field.name}

                `, word(field, '$_'), `
            `)
        }
    }

    function word (field, variable) {
        const bytes = field.bits / 8
        let bite = field.endianness == 'little' ? 0 : bytes - 1
        const stop = field.endianness == 'little' ? bytes : -1
        const direction = field.endianness == 'little' ? 1 : -1
        const shifts = []
        while (bite != stop) {
            const shift = bite ? variable + ' >>> ' + bite * 8 : variable
            shifts.push(`$buffer[$start++] = ${shift} & 0xff`)
            bite += direction
        }
        return shifts.join('\n')
    }

    function lengthEncoding (packet, path) {
        return word(packet, `${path}.${packet.name}.length`)
    }

    function lengthEncoded (packet, path) {
        const i = `$i[${++index}]`
        const looped = word(packet.element, `${path}.${packet.name}[${i}]`)
        const source = $(`
            for (${i} = 0; ${i} < ${path}.${packet.name}.length; ${i}++) {
                `, looped, `
            }
        `)
        index--
        return source
    }

    function checkpoint (checkpoint) {
        const i = packet.lengthEncoded ? '$i' : '[]'
        return $(`
            if ($end - $start < ${checkpoint.lengths.join(' + ')}) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(${root}, ${step}, ${i})
                }
            }
        `)
    }

    function field (packet, path) {
        switch (packet.type) {
        case 'checkpoint':
            // TODO `variables` can be an object member.
            return checkpoint(packet, packet.arrayed)
        case 'structure':
            const source = join(packet.fields.map(field => {
                return field(field, path.concat(packet.name))
            }))
            return $(`
                {
                    let ${packet.name} = object.${packet.name}

                    `, source, `
                }
            `)
            break
        case 'lengthEncoding':
            return lengthEncoding(packet, path)
        case 'lengthEncoded':
            return lengthEncoded(packet, path)
        case 'buffer':
            return buffer(packet)
        case 'integer':
            return integer(path, packet)
        }
    }

    const root = packet.name
    const source = join(packet.fields.map(f => {
        return field(f, [ packet.name ])
    }))
    var variables = [ '$_' ]
    if (packet.lengthEncoded) {
        variables.push('$i = []')
    }
    return $(`
        serializers.${bff ? 'bff' : 'all'}.${packet.name} = function (${packet.name}) {
            return function ($buffer, $start, $end) {
                let ${variables.join(', ')}

                `, source, `

                return { start: $start, serialize: null }
            }
        }
    `)
}

module.exports = function (compiler, definition, options = {}) {
    const source = join(JSON.parse(JSON.stringify(definition)).map(function (packet) {
        if (options.bff) {
            packet.fields = bff([ packet.name ], packet)
        }
        return generate(packet, options.bff)
    }))
    return compiler(source)
}
