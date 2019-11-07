var Variables = require('./variables')
var explode = require('./explode')
var qualify = require('./qualify')
var join = require('./join')
var $= require('programmatic')
var unpackAll = require('./unpack')

function map (packet, bff) {
    function integer (field, assignee, depth) {
        field = explode(field)
        var read = [], bite = field.bite, stop = field.stop
        while (bite != stop) {
            read.unshift('$buffer[$start++]')
            if (bite) {
                read[0] += ' * 0x' + Math.pow(256, bite).toString(16)
            }
            bite += field.direction
        }
        read = read.reverse().join(' +\n')
        if (field.bytes == 1) {
            return assignee + ' = ' + read
        }
        this.step += 2
        var parsed = $(`
            ${assignee} =
                `, read, `
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
        this.step += 2
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
            return this.checkpoint(packet, depth, arrayed)
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
            if (packet.fields != null) {
                var assignee = 'value'
            } else {
                var assignee = qualify('object', depth) + '.' + packet.name
            }
            if (packet.type === 'integer')  {
                return integer(packet, assignee, depth)
            }
            break
        }
        return source
    }

    function checkpoint (packet, depth, arrayed) {
        return $(`
            if (end - start < ${packet.length}) {
                return parse.inc.${this.current.name}(${root}, ${step})($buffer, $start, $end)
            }
        `)
    }

    let current = { name: packet.name }

    const source = field(packet)

    // No need to track the end if we are a whole packet parser.
    const signature = [ '$buffer', '$start', '$end' ]
    if (!bff) signature.pop()


    var entry = 'parse.' + (bff ? 'bff' : 'all') + '.' + packet.name

    const start = bff ? 'this.start = start' : null

    // Parser defintion body.
    const definition = $(`
        ${entry} = function (${signature.join(', ')}) {
            `, source, `

            return ${packet.name}
        }
    `)
    return definition
}

function bff (packet) {
    var checkpoint, fields = [ checkpoint = { type: 'checkpoint', length: 0 } ]
    for (var i = 0, I = packet.fields.length; i < I; i++) {
        var field = JSON.parse(JSON.stringify(packet.fields[i]))
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
    var source = join(definition.map(function (packet) {
        packet = explode(packet)
        if (options.bff) {
            packet.fields = bff(packet)
        }
        return map(packet, options.bff)
    }))
    return compiler(source)
}
