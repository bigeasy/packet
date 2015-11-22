var Variables = require('../variables')
var explode = require('../explode')
var qualify = require('../qualify')
var $ = require('programmatic')

function integer (field, value) {
    var bites = [], bite = field.bite, stop = field.stop, shift
    while (bite != stop) {
        shift = bite ? value + ' >>> ' + bite * 8 : value
        bites.push('buffer[start++] = ' + shift + ' & 0xff')
        bite += field.direction
    }
    return bites.join('\n')
}

function nested (variables, definition, depth) {
    return $('                                                              \n\
        ', serialize(variables, definition, depth), '                       \n\
    ')
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
        var exploded = explode(choice.write)
        exploded.name = packet.name
        return subSerialize(variables, exploded, depth)
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
    var looped = nested(variables, packet.element, depth + 1)
    source = $('                                                            \n\
        ' + array + ' = ' + object + '.' + packet.name + '                  \n\
        ' + length + ' = array.length                                       \n\
        // __blank__                                                        \n\
        ', integer(explode(packet.length), length), '                       \n\
        // __blank__                                                        \n\
        for (' + i + ' = 0; ' + i + ' < length; ' + i + '++) {              \n\
            ' + subObject + ' = array[' + i + ']                            \n\
            ', looped, '                                                    \n\
        }                                                                   \n\
    ')
    return source
}

function subSerialize (variables, packet, depth) {
    switch (packet.type) {
    case 'alternation':
        return alternation(variables, packet, depth)
    case 'lengthEncoded':
        return lengthEncoded(variables, packet, depth)
    default:
        var object = qualify('object', depth)
        var field = explode(packet)
        if (field.type === 'integer')  {
            return $('                                                      \n\
                ', integer(field, object + '.' + packet.name), '            \n\
                // __reference__                                            \n\
            ')
        }
    }
}

function serialize (variables, definition, depth) {
    var sources = []
    definition.fields.forEach(function (packet) {
        sources.push(subSerialize(variables, packet, depth))
    })
    return joinSources(sources)
}

function joinSources (sources) {
    var source = sources[0]
    for (var i = 1, I = sources.length; i < I; i++) {
        source = $('                                                        \n\
            ', source, '                                                    \n\
            // __blank__                                                    \n\
            ', sources[i], '                                                \n\
        ')
    }
    return source
}

function serializer (packet) {
    var variables = new Variables
    var source = $('                                                        \n\
        ', serialize(variables, packet, 0), '                               \n\
    ')
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
    var source = $('                                                        \n\
        var serializers = {}                                                \n\
    ')
    definition.forEach(function (packet) {
        source = $('                                                        \n\
            ', source, '                                                    \n\
            // __blank__                                                    \n\
            ', serializer(packet), '                    \n\
        ')
    })
    source = $('                                                            \n\
        ', source, '                                                        \n\
        // __blank__                                                        \n\
        return serializers                                                  \n\
    ')
    return compiler(source)
}
