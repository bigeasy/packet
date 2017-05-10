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
        return $(' \n\
            ' + value + ' = new Buffer(' + object + '.' + field.name + ', ' + JSON.stringify(field.transform) + ')\n\
            for (var ' + index + ' = 0, ' + end + ' = ' + value + '.length; ' + index + ' < ' + end + '; ' + index + '++) {\n\
                buffer[start++] = ' + value + '[' + index + '] \n\
            }\n\
            ' + value + ' = ' + JSON.stringify(field.terminator) + '\n\
            for (var ' + index + ' = 0, ' + end + ' = ' + value + '.length; ' + index + ' < ' + end + '; ' + index + '++) {\n\
                buffer[start++] = ' + value + '[' + index + '] \n\
            }\n\
        ')
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
        return $('                                                          \n\
            value =                                                         \n\
                ', packing.join(' |\n'), '                                  \n\
            __blank__                                                       \n\
            ', this.word(field, 'value'), '                                 \n\
        ')
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
    source = $('                                                            \n\
        ' + array + ' = ' + object + '.' + packet.name + '                  \n\
        ' + length + ' = array.length                                       \n\
        __blank__                                                           \n\
        ', this.word(packet.length, length), '                              \n\
        __blank__                                                           \n\
        for (' + i + ' = 0; ' + i + ' < length; ' + i + '++) {              \n\
            ' + subObject + ' = array[' + i + ']                            \n\
            ', looped, '                                                    \n\
        }                                                                   \n\
    ')
    return source
}

Generator.prototype.checkpoint = function (variables, packet, depth, arrayed) {
    var arrayed = arrayed ? $('                                             \n\
        length: length,                                                     \n\
        index: i || 0,                                                      \n\
    ') : ''
    variables.hoist('serializer')
    var stack = 'serializer.stack = [{'
        for (var i = -1; i < 0; i++) {
            stack = $('                                                     \n\
                __reference__                                               \n\
                ', stack, '                                                 \n\
                __reference__                                               \n\
                    ', arrayed ,'                                           \n\
                    object: object                                          \n\
            ')
        }
        stack = $('                                                         \n\
            __reference__                                                   \n\
            ', stack, '                                                     \n\
            }]                                                              \n\
        ')
    return $('                                                              \n\
        if (end - start < ' + packet.length + ') {                          \n\
            serializer = new serializers.inc.object                         \n\
            serializer.step = ' + this.step + '                             \n\
            ', stack, '                                                     \n\
            return { start: start, serializer: serializer }                 \n\
        }                                                                   \n\
    ')
}

Generator.prototype._condition = function (variables, packet, depth, arrayed) {
    var branches = '', test = 'if'
    packet.conditions.forEach(function (condition) {
        var block = joinSources(condition.fields.map(function (packet) {
            return this.field(variables, explode(packet), depth, arrayed)
        }.bind(this)))
        test = condition.test == null  ? '} else {' : test + ' (' + condition.test + ') {'
        branches = $('                                                      \n\
            ', branches, '                                                  \n\
            ' + test + '                                                    \n\
                ', block, '                                                 \n\
        ')
        test = '} else if'
    }, this)
    return $('                                                              \n\
        ', branches, '                                                      \n\
        }                                                                   \n\
    ')
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
        return $('                                                          \n\
            ', assignment, '                                                \n\
            __blank__                                                       \n\
            ', source ,'                                                    \n\
        ')
        break
    case 'lengthEncoded':
        return this.lengthEncoded(variables, packet, depth)
    case 'buffer':
        return this.buffer(variables, packet, depth)
    default:
        var object = qualify('object', depth)
        if (packet.type === 'integer')  {
            return $('                                                      \n\
                ', this.integer(variables, packet, object), '               \n\
                __reference__                                               \n\
            ')
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
    return $('                                                              \n\
        ' + object + ' = function (object) {                                \n\
            this.object = object                                            \n\
        }                                                                   \n\
        __blank__                                                           \n\
        ' + object + '.prototype.serialize = function (' + signature + ') { \n\
            __blank__                                                       \n\
            var object = this.object                                        \n\
            __blank__                                                       \n\
            ', String(variables), '                                         \n\
            __blank__                                                       \n\
            ', source, '                                                    \n\
            __blank__                                                       \n\
            return { start: start, serializer: null }                       \n\
        }                                                                   \n\
    ')
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
