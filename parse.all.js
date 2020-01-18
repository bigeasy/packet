const join = require('./join')
const unpackAll = require('./unpack')
const $ = require('programmatic')

function map (packet, bff) {
    let index = -1
    let step = 1

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
            case 'lengthEncoding':
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

    function lengthEncoding (object, field) {
        index++
        return $(`
            $i[${index}] = 0
            `, integer(field.length, `$I[${index}]`), `
        `)
    }

    function lengthEncoded (object, field) {
        step += 2
        const i = `$i[${index}]`
        const I = `$I[${index}]`
        index--
        return $(`
            for (; ${i} < ${I}; ${i}++) {
                `, integer(field.element, `${object.name}.${field.name}[${i}]`) ,`
            }
        `)
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
        case 'lengthEncoding':
            return lengthEncoding(object, property)
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
        const signature = [ packet.name, step ]
        if (packet.lengthEncoded) {
            signature.push('$i', '$I')
        }
        return $(`
            if ($end - $start < ${checkpoint.lengths.join(' + ')}) {
                return parsers.inc.${packet.name}(${signature.join(', ')})($buffer, $start, $end)
            }
        `)
    }

    const source = dispatch(packet)
    const variables = packet.lengthEncoded ? 'let $i = [], $I = []' : null

    if (bff) {
        return $(`
            parsers.bff.${packet.name} = function () {
                return function parse ($buffer, $start, $end) {
                    `, variables, `

                    `, source, `

                    return { start: $start, object: object, parse: null }
                }
            }
        `)
    }

    return $(`
        parsers.all.${packet.name} = function ($buffer, $start) {
            `, variables, `

            `, source, `

            return ${packet.name}
        }
    `)
}

let index = -1
function bff (path, packet) {
    let checkpoint = { type: 'checkpoint', lengths: [ 0 ] }, fields = [ checkpoint ]
    for (let i = 0, I = packet.fields.length; i < I; i++) {
        const field = packet.fields[i]
        switch (field.type) {
        case 'lengthEncoded':
            index++
            checkpoint.lengths[0] += field.length.bits / 8
            // Maybe split this up in the language definition?
            fields.push({ ...field, type: 'lengthEncoding' })
            fields.push(checkpoint = { type: 'checkpoint', lengths: [] })
            switch (field.element.type) {
            case 'structure':
                field.element.fields = bff(field.element)
                break
            default:
                checkpoint.lengths.push(`${field.element.bits / 8} * $I[${index}]`)
                break
            }
            index--
            break
        default:
            checkpoint.lengths[0] += field.bits / 8
            break
        }
        fields.push(field)
    }
    return fields
}

// TODO Split encoding and encoded in the language.
function bogus (path, packet) {
    let fields = []
    for (let i = 0, I = packet.fields.length; i < I; i++) {
        const field = packet.fields[i]
        switch (field.type) {
        case 'lengthEncoded':
            fields.push({ ...field, type: 'lengthEncoding' })
            break
        }
        fields.push(field)
    }
    return fields
}

module.exports = function (compiler, definition, options = {}) {
    const source = join(JSON.parse(JSON.stringify(definition)).map(function (packet) {
        if (options.bff) {
            packet.fields = bff([ packet.name ], packet)
        } else {
            packet.fields = bogus([ packet.name ], packet)
        }
        return map(packet, options.bff)
    }))
    return compiler(source)
}
