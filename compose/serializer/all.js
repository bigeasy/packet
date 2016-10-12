var Variables = require('../variables')
var explode = require('../explode')
var qualify = require('../qualify')
var joinSources = require('../join-sources')
var pack = require('../pack')
var $ = require('programmatic')

function Generator () {
}

Generator.prototype.integer = function (variables, field, object) {
    if (field.packing) {
        var offset = 0
        var packing = []
        variables.hoist('value')

        for (var i = 0, I = field.packing.length; i < I; i++) {
            var packed = field.packing[i]
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

Generator.prototype.alternation = function (variables, packet, depth) {
    var select = qualify('select', depth)
    variables.hoist(select)
    packet.choose.forEach(function (choice, index) {
        var when = choice.write.when || {}, test
        if (when.range != null) {
            var range = []
            if (when.range.from) {
                range.push(when.range.from + ' <= select')
            }
            if (when.range.to) {
                range.push('select < ' + when.range.to)
            }
            test = range.join(' && ')
        }
        choice.condition = '} else {'
        if (test) {
            if (index === 0) {
                choice.condition = 'if (' + test + ') {'
            } else {
                choice.condition = '} else if (' + test + ') {'
            }
        }
    })
    var choices = ''
    function slurp (choice) {
        choice.write.field.name = packet.name
        return this.field(variables, choice.write.field, depth)
    }
    packet.choose.forEach(function (choice) {
        choices = $('                                                       \n\
            // __reference__                                                \n\
            ', choices, '                                                   \n\
            ', choice.condition, '                                          \n\
            // __blank__                                                    \n\
                ', slurp.call(this, choice), '                              \n\
            // __blank__                                                    \n\
        ')
    }, this)
    var source = $('                                                        \n\
        ' + select + ' = object.' + packet.name + '                         \n\
    ')
    choices = $('                                                           \n\
        // __reference__                                                    \n\
        ', choices, '                                                       \n\
        }                                                                   \n\
    ')
    return $('                                                              \n\
        ', source, '                                                        \n\
        // __blank__                                                        \n\
        ', choices, '                                                       \n\
    ')
}

Generator.prototype.lengthEncoded = function (variables, packet, depth) {
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
    var looped = this.field(variables, packet.element, depth + 1)
    source = $('                                                            \n\
        ' + array + ' = ' + object + '.' + packet.name + '                  \n\
        ' + length + ' = array.length                                       \n\
        // __blank__                                                        \n\
        ', this.word(packet.length, length), '                              \n\
        // __blank__                                                        \n\
        for (' + i + ' = 0; ' + i + ' < length; ' + i + '++) {              \n\
            ' + subObject + ' = array[' + i + ']                            \n\
            ', looped, '                                                    \n\
        }                                                                   \n\
    ')
    return source
}

Generator.prototype.checkpoint = function (variables, packet, depth) {
    return ''
}

Generator.prototype.field = function (variables, packet, depth) {
    switch (packet.type) {
    case 'checkpoint':
        return this.checkpoint(variables, packet, depth)
    case 'structure':
        return joinSources(packet.fields.map(function (packet) {
            return this.field(variables, packet, depth)
        }.bind(this)))
    case 'alternation':
        return this.alternation(variables, packet, depth)
    case 'lengthEncoded':
        return this.lengthEncoded(variables, packet, depth)
    default:
        var object = qualify('object', depth)
        if (packet.type === 'integer')  {
            return $('                                                      \n\
                ', this.integer(variables, packet, object), '               \n\
                // __reference__                                            \n\
            ')
        }
    }
}

Generator.prototype.serializer = function (packet, bff) {
    var variables = new Variables
    var source = this.field(variables, packet, 0)
    var object = 'serializers.' + (bff ? 'bff' : 'all') + '.' + packet.name
    return $('                                                              \n\
        ' + object + ' = function (object) {                                \n\
            this.object = object                                            \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        ' + object + '.prototype.serialize = function (buffer, start) {     \n\
            // __blank__                                                    \n\
            var object = this.object                                        \n\
            // __blank__                                                    \n\
            ', String(variables), '                                         \n\
            // __blank__                                                    \n\
            ', source, '                                                    \n\
            // __blank__                                                    \n\
            return { start: start, serializer: null }                       \n\
        }                                                                   \n\
    ')
}

function bff (packet) {
    var checkpoint, fields = [ checkpoint = { type: 'checkpoint', length: 0 } ]
    for (var i = 0, I = packet.fields.length; i < I; i++) {
        var field = packet.fields[i]
        checkpoint.length += field.bytes
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
