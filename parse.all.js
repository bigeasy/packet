const join = require('./join')
const $ = require('programmatic')
const unpackAll = require('./unpack')

function map (packet, bff) {
    let isLengthEncoded = packet.lengthEncoded
    let index = -1
    let step = 0

    function integer (field, assignee) {
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
        if (bytes == 1) {
            return `${assignee} = ${reads.join('')}`
        }
        step += 2
        const parsed = $(`
            ${assignee} =
                `, reads.reverse().join(' +\n'), `
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
    function vivifier (asignee, packet) {
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
            const ${asignee} = {
                `, fields.join(',\n'), `
            }
        `)
    }

    function lengthEncoded (object, property) {
        step += 2
        index++
        const i = `$i[${index}]`
        const I = `$I[${index}]`
        return $(`
            `, integer(property.length, I), `

            for (${i} = 0; ${i} < ${I}; ${i}++) {
                `, integer(property.element, `${object.name}.${property.name}[${i}]`) ,`
            }
        `)
        index--
    }

    function dispatch (property, object) {
        switch (property.type) {
        case 'checkpoint':
            return checkpoint(property)
        case 'structure':
            return $(`
                `, vivifier(property.name, property), `

                `, join(property.fields.map(function (field) {
                    return dispatch(field, property)
                }.bind(this))), `
            `)
        case 'lengthEncoded':
            return lengthEncoded(object, property)
        case 'buffer':
            return this.buffer(packet, depth)
        default:
            const assignee = property.fields != null ? 'value' : `object.${property.name}`
            if (property.type === 'integer') {
                return integer(property, assignee)
            }
            break
        }
    }

    function checkpoint (checkpoint, depth, arrayed) {
        return $(`
            if ($end - $start < ${checkpoint.lengths.join(' + ')}) {
                return parsers.inc.${packet.name}(${packet.name}, ${step})($buffer, $start, $end)
            }
        `)
    }

    const source = dispatch(packet)

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

    const variables = isLengthEncoded ? 'let $i = [], $I = []' : null

    return $(`
        ${entry} = function (${signature.join(', ')}) {
            `, variables, `

            `, source, `

            return ${packet.name}
        }
    `)
}

function bff (packet) {
    const checkpoint = { type: 'checkpoint', lengths: [ 0 ] }, fields = [ checkpoint ]
    for (let i = 0, I = packet.fields.length; i < I; i++) {
        const field = packet.fields[i]
        switch (field.type) {
        case 'lengthEncoded':
            checkpoint.lengths[0] += field.length.bytes
            switch (field.element.type) {
            case 'structure':
                field.element.fields = bff(field.element)
                break
            default:
                throw new Error
            }
            break
        default:
            checkpoint.lengths[0] += field.bits / 8
            break
        }
        fields.push(field)
    }
    return fields
}

module.exports = function (compiler, definition, options = {}) {
    const source = join(JSON.parse(JSON.stringify(definition)).map(function (packet) {
        if (options.bff) {
            packet.fields = bff(packet)
        }
        return map(packet, options.bff)
    }))
    return compiler(source)
}
