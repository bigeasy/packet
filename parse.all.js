var Variables = require('./variables')
var explode = require('./explode')
var qualify = require('./qualify')
var joinSources = require('./join-sources')
var $= require('programmatic')
var unpackAll = require('./unpack')

function Generator () {
    this.step = 0
}

Generator.prototype.buffer = function (variables, packet, depth) {
    var assignee = qualify('object', depth) + '.' + packet.name
    packet = explode(packet)
    variables.hoist('index')
    variables.hoist('terminator')
    return $(`
        var terminator = ${JSON.stringify(packet.terminator)}
        var index = buffer.indexOf(new Buffer(terminator), start)
        ${assignee} = buffer.toString(${JSON.stringify(packet.tranform)}, start, index)
        start = index + terminator.length
    `)
}

Generator.prototype.integer = function (field, assignee, depth) {
    field = explode(field)
    var read = [], bite = field.bite, stop = field.stop
    while (bite != stop) {
        read.unshift('buffer[start++]')
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
Generator.prototype._constructor = function (variables, packet, depth) {
    var fields = [], object = qualify('object', depth)
    variables.hoist(object)
    packet.fields.forEach(function (field) {
        switch (field.type) {
        case 'checkpoint':
        case 'condition':
            break
        case 'lengthEncoded':
            fields.push(field.name + ': new Array')
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
        ${object} = {
            `, fields.join(',\n'), `
        }
    `)
}

Generator.prototype.lengthEncoded = function (variables, packet, depth) {
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

Generator.prototype.checkpoint = function (variables, packet, depth, arrayed) {
    return $(`
        if (end - start < ${packet.length}) {
            var parser = new parsers.inc.${this.current.name}
            return parser.parse(buffer, this.start, end)
        }
    `)
}

Generator.prototype._condition = function (variables, packet, depth, arrayed) {
    var branches = '', test = 'if'
    packet.conditions.forEach(function (condition) {
        var block = joinSources(condition.fields.map(function (packet) {
            return this.field(variables, explode(packet), depth, arrayed)
        }.bind(this)))
        test = condition.test == null  ? '} else {' : test + ' (' + condition.test + ') {'
        branches = $(`
            `, branches, `
            ${test}
                `, block, `
        `)
        test = '} else if'
    }, this)
    return $(`
        `, branches, `
        }
    `)
}

Generator.prototype.field = function (variables, packet, depth, arrayed) {
    switch (packet.type) {
    case 'checkpoint':
        return this.checkpoint(variables, packet, depth, arrayed)
    case 'condition':
        return this._condition(variables, packet, depth, arrayed)
    case 'structure':
        var constructor = this._constructor(variables, packet, depth + 1)
        if (depth != -1 && packet.name) {
            constructor = qualify('object', depth) + '.' + packet.name + ' = ' + constructor
        }
        return $(`
            `, constructor, `

            `, joinSources(packet.fields.map(function (packet) {
                return this.field(variables, packet, depth + 1, arrayed)
            }.bind(this))), `
        `)
    case 'lengthEncoded':
        return this.lengthEncoded(variables, packet, depth)
    case 'buffer':
        return this.buffer(variables, packet, depth)
    default:
        if (packet.fields != null) {
            variables.hoist('value')
            var assignee = 'value'
        } else {
            var assignee = qualify('object', depth) + '.' + packet.name
        }
        if (packet.type === 'integer')  {
            return $(`
                `, this.integer(packet, assignee, depth), `
            `)
        }
        break
    }
    return source
}

Generator.prototype.parser = function (packet, bff) {
    this.current = { name: packet.name }

    var variables = new Variables

    var source = this.field(variables, packet, -1, false)

    // No need to track the end if we are a whole packet parser.
    var signature = [ 'buffer', 'start', 'end' ]
    if (!bff) signature.pop()
    signature = signature.join(', ')


    var object = 'parsers.' + (bff ? 'bff' : 'all') + '.' + packet.name

    var inc = bff ? $(`

        parsers.bff._inc = function (buffer, start, end, stack) {
            var parser = new parsers.inc.${packet.name}
            return 1
        }
    `) : ''

    var start = bff ? 'this.start = start' : ''

    // Parser defintion body.
    return $(`
        ${object} = function () {
        }

        `, inc, `

        ${object}.prototype.parse = function (${signature}) {
            `, start ,`

            `, String(variables), `

            `, source, `

            return { start: start, object: object, parser: null }
        }
    `)
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
    var source = joinSources(definition.map(function (packet) {
        packet = explode(packet)
        if (options.bff) {
            packet.fields = bff(packet)
        }
        return new Generator().parser(packet, options.bff)
    }))
    return compiler(source)
}
