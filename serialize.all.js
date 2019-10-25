var Variables = require('./variables')
var explode = require('./explode')
var qualify = require('./qualify')
var joinSources = require('./join-sources')
var pack = require('./pack')
var $ = require('programmatic')

function Generator () {
    this.step = 0
}

Generator.prototype.buffer = function (variables, field, depth) {
    var object = qualify('object', depth)
    var value = qualify('object', depth)
    var index = qualify('i', depth)
    var end = qualify('I', depth)
    variables.hoist(value)
    variables.hoist(index)
    variables.hoist(end)
    variables.hoist(object)
    if (field.transform) {
        return $(`
            ${value} = new Buffer(${object}.${field.name}, ${JSON.stringify(field.transform)})
            for (var ${index} = 0, ${end} = ${value}.length; ${index} < ${end}; ${index}++) {
                buffer[start++] = ${value}[${index}]
            }
            ${value} = ${JSON.stringify(field.terminator)}
            for (var ${index} = 0, ${end} = ${value}.length; ${index} < ${end}; ${index}++) {
                buffer[start++] = ${value}[${index}]
            }
        `)
    }
}

Generator.prototype.integer = function (variables, field, object) {
    this.step += 2
    if (field.fields) {
        var offset = 0
        var packing = []
        variables.hoist('value')

        for (var i = 0, I = field.fields.length; i < I; i++) {
            var packed = field.fields[i]
            var variable = object + '.' + packed.name
            packing.push(' (' + pack(field.bits, offset, packed.bits, variable) + ')')
            offset += packed.bits
        }
        return $(`
            value =
                `, packing.join(' |\n'), `

            `, this.word(field, 'value'), `
        `)
    } else {
        return this.word(field, object + '.' + field.name)
    }
}

// TODO How do I inject code?
Generator.prototype.word = function (field, variable) {
    var bites = [], bite = field.bite, stop = field.stop, shift, variable
    while (bite != stop) {
        shift = bite ? variable + ' >>> ' + bite * 8 : variable
        bites.push('buffer[start++] = ' + shift + ' & 0xff')
        bite += field.direction
    }
    return bites.join('\n')
}

Generator.prototype.lengthEncoded = function (variables, packet, depth) {
    this.step += 2
    var source = ''
    var object = qualify('object', depth)
    var length = qualify('length', depth)
    var array = qualify('array', depth)
    var subObject = qualify('object', depth + 1)
    var i = qualify('i', depth)
    variables.hoist(i)
    variables.hoist(length)
    variables.hoist(array)
    variables.hoist(subObject)
    var looped = joinSources(packet.element.fields.map(function (packet) {
        return this.field(variables, packet, depth + 1, true)
    }.bind(this)))
    source = $(`
        ${array} = ${object}.${packet.name}
        ${length} = array.length

        `, this.word(packet.length, length), `

        for (${i} = 0; ${i} < length; ${i}++) {
            ${subObject} = array[${i}]
            `, looped, `
        }
    `)
    return source
}

Generator.prototype.checkpoint = function (variables, packet, depth, arrayed) {
    var arrayed = arrayed ? $(`
        length: length,
        index: i || 0,
    `) : ''
    variables.hoist('serializer')
    var stack = 'serializer.stack = [{'
    for (var i = -1; i < 0; i++) {
        stack = $(`
            `, stack, `
                `, arrayed ,`
                object: object
        `)
    }
    stack = $(`
        `, stack, `
        }]
    `)
    return $(`
        if (end - start < ${packet.length}) {
            serializer = new serializers.inc.object
            serializer.step = ${this.step}
            `, stack, `
            return { start: start, serializer: serializer }
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
        // TODO `variables` can be an object member.
        return this.checkpoint(variables, packet, depth, packet.arrayed)
    case 'condition':
        return this._condition(variables, packet, depth, packet.arrayed)
    case 'structure':
        variables.hoist(qualify('object', depth + 1))
        var assignment = qualify('object', depth + 1) + ' = ' +
            qualify('object', depth) + '.' + packet.name
        var source = joinSources(packet.fields.map(function (packet) {
            return this.field(variables, packet, depth + 1, false)
        }.bind(this)))
        return $(`
            `, assignment, `

            `, source, `
        `)
        break
    case 'lengthEncoded':
        return this.lengthEncoded(variables, packet, depth)
    case 'buffer':
        return this.buffer(variables, packet, depth)
    default:
        var object = qualify('object', depth)
        if (packet.type === 'integer')  {
            return $(`
                `, this.integer(variables, packet, object), `
            `)
        }
    }
}

Generator.prototype.serializer = function (packet, bff) {
    var variables = new Variables
    var source = joinSources(packet.fields.map(function (packet) {
        return this.field(variables, packet, 0, false)
    }.bind(this)))
    var object = 'serializers.' + (bff ? 'bff' : 'all') + '.' + packet.name
    var signature = bff ? 'buffer, start, end' : 'buffer, start'
    return $(`
        ${object} = function (object) {
            this.object = object
        }

        ${object}.prototype.serialize = function (${signature}) {

            var object = this.object

            `, String(variables), `

            `, source, `

            return { start: start, serializer: null }
        }
    `)
}

function bff (packet, arrayed) {
    var checkpoint, fields = [ checkpoint = { type: 'checkpoint', length: 0 } ]
    for (var i = 0, I = packet.fields.length; i < I; i++) {
        var field = JSON.parse(JSON.stringify(packet.fields[i]))
        switch (field.type) {
        case 'lengthEncoded':
            checkpoint.length += field.length.bytes
            checkpoint.arrayed = true
            switch (field.element.type) {
            case 'structure':
                field.element.fields = bff(field.element, true)
                break
            default:
                throw new Error
            }
            break
        default:
            checkpoint.length += field.bytes
            checkpoint.arrayed = !! arrayed
            break
        }
        fields.push(field)
    }
    return fields
}

module.exports = function (compiler, definition, options) {
    // TODO Options is required.
    options || (options = {})
    var source = joinSources(definition.map(function (packet) {
        packet = explode(packet)
        if (options.bff) {
            packet.fields = bff(packet)
        }
        return new Generator().serializer(packet, options.bff)
    }))
    return compiler(source)
}
