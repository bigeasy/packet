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

function lengthEncoded (variables, name, field, depth) {
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
    var looped = nested(variables, field.element, depth + 1)
    source = $('                                                            \n\
        ' + array + ' = ' + object + '.' + name + '                         \n\
        ' + length + ' = array.length                                       \n\
        // __blank__                                                        \n\
        ', integer(explode(field.length), length), '                        \n\
        // __blank__                                                        \n\
        for (' + i + ' = 0; ' + i + ' < length; ' + i + '++) {              \n\
            ' + subObject + ' = array[' + i + ']                            \n\
            ', looped, '                                                    \n\
        }                                                                   \n\
    ')
    return source
}

function serialize (variables, definition, depth) {
    var sources = []
    for (var name in definition) {
        if (name[0] === '$') {
            continue
        }
        var field = definition[name]
        if (field.length) {
            sources.push(lengthEncoded(variables, name, field, depth))
        } else {
            var object = qualify('object', depth)
            field = explode(field)
            if (field.type === 'integer')  {
                sources.push($('                                                \n\
                    ', integer(field, object + '.' + name), '               \n\
                    // __reference__                                        \n\
                '))
            }
        }
    }
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

function serializer (name, definition) {
    var variables = new Variables
    var source = $('                                                        \n\
        ', serialize(variables, definition, 0), '                           \n\
    ')
    return $('                                                              \n\
        serializers.' + name + ' = function (object) {                      \n\
            this.object = object                                            \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        serializers.' + name + '.prototype.serialize = function (engine) {  \n\
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
    Object.keys(definition).forEach(function (packet) {
        source = $('                                                        \n\
            ', source, '                                                    \n\
            // __blank__                                                    \n\
            ', serializer(packet, definition[packet]), '                    \n\
        ')
    })
    source = $('                                                            \n\
        ', source, '                                                        \n\
        // __blank__                                                        \n\
        return serializers                                                  \n\
    ')
    return compiler(source)
}
