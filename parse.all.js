const join = require('./join')
const $ = require('programmatic')
const unpackAll = require('./unpack')

function map (packet, bff) {
    let step = 0

    function integer (field, assignee, depth) {
        const bytes = field.bits / 8
        const stop = field.endianness == 'little' ? bytes : -1
        let bite = field.endianness == 'little' ? 0 : bytes - 1
        const direction = field.endianness == 'little' ? 1 : -1
        const read = []
        while (bite != stop) {
            read.unshift('$buffer[$start++]')
            if (bite) {
                read[0] += ' * 0x' + Math.pow(256, bite).toString(16)
            }
            bite += direction
        }
        if (bytes == 1) {
            return `${assignee}  = ${read.join('')}`
        }
        step += 2
        const parsed = $(`
            ${assignee} =
                `, read.reverse().join(' +\n'), `
        `)
        if (field.fields) {
            return $(`
                `, parsed, `

                `, unpackAll(qualify('object', depth), field), `
            `)
        }
        return parsed
    }

    // TODO Create a null entry, then assign a value later on.
    function vivifier (packet, depth) {
        const fields = []
        packet.fields.forEach(function (field) {
            switch (field.type) {
            case 'checkpoint':
            case 'condition':
                break
            case 'lengthEncoded':
                fields.push(field.name + ': new Array')
                break
            case 'integer':
                fields.push(`${field.name}: 0`)
                break
            default:
                if (field.type == 'structure' || field.fields == null) {
                    fields.push(field.name + ': null')
                } else {
                    field.fields.forEach(function (field) {
                        fields.push(field.name + ': null')
                    })
                }
                break
            }
        })
        if (fields.length == 0) {
            return object + ' = {}'
        }
        return $(`
            {
                `, fields.join(',\n'), `
            }
        `)
    }

    function lengthEncoded (variables, packet, depth) {
        step += 2
        var source = ''
        var length = qualify('length', depth)
        var object = qualify('object', depth)
        var subObject = qualify('object', depth + 1)
        var i = qualify('i', depth)
        variables.hoist(i)
        variables.hoist(length)
        var looped = this.field(variables, packet.element, depth, true)
        return $(`
            `, this.integer(packet.length, length, depth), `

            for (${i} = 0; ${i} < ${length}; ${i}++) {
                `, looped, `

                ${object}.${packet.name}.push(${subObject})
            }
        `)
    }

    function field (packet, depth, arrayed) {
        switch (packet.type) {
        case 'checkpoint':
            return checkpoint(packet, depth, arrayed)
        case 'structure':
            let constructor = null
            if (depth != -1 && packet.name) {
                constructor = `const ${packet.name} = ${vivifier(packet)}`
            }
            return $(`
                `, constructor, `

                `, join(packet.fields.map(function (packet) {
                    return field(packet, arrayed)
                }.bind(this))), `
            `)
        case 'lengthEncoded':
            return this.lengthEncoded(packet, depth)
        case 'buffer':
            return this.buffer(packet, depth)
        default:
            const assignee = packet.fields != null ? 'value' : `object.${packet.name}`
            if (packet.type === 'integer') {
                return integer(packet, assignee, depth)
            }
            break
        }
        return source
    }

    function checkpoint (_packet, depth, arrayed) {
        return $(`
            if ($end - $start < ${_packet.length}) {
                return parsers.inc.${packet.name}(${packet.name}, ${step})($buffer, $start, $end)
            }
        `)
    }

    const source = field(packet)

    // No need to track the end if we are a whole packet parser.
    const signature = [ '$buffer', '$start', '$end' ]
    if (!bff) signature.pop()


    const entry = `parsers.${bff ? 'bff' : 'all'}.${packet.name}`

    if (bff) {
        return $(`
            ${entry} = function () {
                return function parse ($buffer, $start, $end) {
                    `, source, `

                    return { start: $start, object: object, parse: null }
                }
            }
        `)
    }

    return $(`
        ${entry} = function (${signature.join(', ')}) {
            `, source, `

            return ${packet.name}
        }
    `)
}

function bff (packet) {
    const checkpoint = { type: 'checkpoint', length: 0 }, fields = [ checkpoint ]
    for (let i = 0, I = packet.fields.length; i < I; i++) {
        const field = packet.fields[i]
        switch (field.type) {
        case 'lengthEncoded':
            checkpoint.length += field.length.bytes
            switch (field.element.type) {
            case 'structure':
                field.element.fields = bff(field.element)
                break
            default:
                throw new Error
            }
            break
        default:
            checkpoint.length += field.bytes
            break
        }
        fields.push(field)
    }
    return fields
}

module.exports = function (compiler, definition, options) {
    options || (options = {})
    const source = join(definition.map(function (packet) {
        if (options.bff) {
            packet.fields = bff(packet)
        }
        return map(packet, options.bff)
    }))
    return compiler(source)
}
