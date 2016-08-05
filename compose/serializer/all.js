var Variables = require('../variables')
var explode = require('../explode')
var qualify = require('../qualify')
var joinSources = require('../join-sources')
var pack = require('../pack')
var $ = require('programmatic')

function integer (variables, field, object) {
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
            ', word(field, 'value'), '                                      \n\
        ')
    } else {
        return word(field, object + '.' + field.name)
    }
}

// TODO How do I inject code?
function word (field, variable) {
    var bites = [], bite = field.bite, stop = field.stop, shift, variable
    while (bite != stop) {
        shift = bite ? variable + ' >>> ' + bite * 8 : variable
        bites.push('buffer[start++] = ' + shift + ' & 0xff')
        bite += field.direction
    }
    return bites.join('\n')
}

function alternation (variables, packet, depth) {
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
        return field(variables, choice.write.field, depth)
    }
    packet.choose.forEach(function (choice) {
        choices = $('                                                       \n\
            // __reference__                                                \n\
            ', choices, '                                                   \n\
            ', choice.condition, '                                          \n\
            // __blank__                                                    \n\
                ', slurp(choice), '                                         \n\
            // __blank__                                                    \n\
        ')
    })
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

function lengthEncoded (variables, packet, depth) {
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
    var looped = field(variables, packet.element, depth + 1)
    source = $('                                                            \n\
        ' + array + ' = ' + object + '.' + packet.name + '                  \n\
        ' + length + ' = array.length                                       \n\
        // __blank__                                                        \n\
        ', word(packet.length, length), '                                   \n\
        // __blank__                                                        \n\
        for (' + i + ' = 0; ' + i + ' < length; ' + i + '++) {              \n\
            ' + subObject + ' = array[' + i + ']                            \n\
            ', looped, '                                                    \n\
        }                                                                   \n\
    ')
    return source
}

function field (variables, packet, depth) {
    switch (packet.type) {
    case 'structure':
        return joinSources(packet.fields.map(function (packet) {
            return field(variables, packet, depth)
        }))
    case 'alternation':
        return alternation(variables, packet, depth)
    case 'lengthEncoded':
        return lengthEncoded(variables, packet, depth)
    default:
        var object = qualify('object', depth)
        if (packet.type === 'integer')  {
            return $('                                                      \n\
                ', integer(variables, packet, object), '                    \n\
                // __reference__                                            \n\
            ')
        }
    }
}

function serializer (packet) {
    var variables = new Variables
    var source = field(variables, packet, 0)
    return $('                                                              \n\
        serializers.' + packet.name + ' = function (object) {               \n\
            this.object = object                                            \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        serializers.' + packet.name + '.prototype.serialize = function (engine) {  \n\
            var buffer = engine.buffer                                      \n\
            var start = engine.start                                        \n\
            var end = engine.end                                            \n\
            // __blank__                                                    \n\
            var object = this.object                                        \n\
            // __blank__                                                    \n\
            ', String(variables), '                                         \n\
            // __blank__                                                    \n\
            ', source, '                                                    \n\
            // __blank__                                                    \n\
            engine.start = start                                            \n\
            // __blank__                                                    \n\
            return object                                                   \n\
        }                                                                   \n\
    ')
}

module.exports = function (compiler, definition) {
    var source = joinSources(definition.map(function (packet) {
        return serializer(explode(packet))
    }))
    source = $('                                                            \n\
        var serializers = {}                                                \n\
        // __blank__                                                        \n\
        ', source, '                                                        \n\
        // __blank__                                                        \n\
        return serializers                                                  \n\
    ')
    return compiler(source)
}
