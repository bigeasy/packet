var Variables = require('../variables')
var explode = require('../explode')
var qualify = require('../qualify')
var $ = require('programmatic')

function integer (field, assignee) {
    var read = [], bite = field.bite, stop = field.stop
    while (bite != stop) {
        read.unshift('buffer[start++]')
        if (bite) {
            read[0] += ' * 0x' + Math.pow(256, bite).toString(16)
        }
        bite += field.direction
    }
    read = read.reverse().join(' + \n')
    if (field.bytes == 1) {
        return assignee + ' = ' + read
    }
    return $('                                                              \n\
        ' + assignee + ' =                                                  \n\
            ', read, '')
}

function constructor (variables, definition, depth) {
    var fields = [], object = qualify('object', depth)
    variables.hoist(object)
    for (var name in definition) {
        if (name[0] === '$') {
            continue
        }
        var field = definition[name]
        if (field.length) {
            fields.push(name + ': new Array')
        } else {
            fields.push(name + ': null')
        }
    }
    return $('                                                              \n\
        ' + object + ' = {                                                  \n\
            ', fields.join(',\n'), '                                        \n\
        }                                                                   \n\
    ')
}

function nested (variables, definition, depth) {
    return $('                                                              \n\
        ', constructor(variables, definition, depth), '                     \n\
        ', parse(variables, definition, depth), '                           \n\
    ')
}

function alternation (variables, name, field, depth) {
    var select = qualify('select', depth)
    variables.hoist(select)
    field.select = explode(field.select)
    var rewind = field.select.bytes
    var source = $('                                                        \n\
        ', integer(field.select, select), '                                 \n\
        start -= ' + rewind + '                                             \n\
    ')
    field.choose.forEach(function (option, index) {
        var when = option.read.when || {}, test
        if (when.and != null) {
            test = 'select & 0x' + when.and.toString(16)
        }
        option.condition = '} else {'
        if (test) {
            if (index === 0) {
                option.condition = 'if (' + test + ') {'
            } else {
                option.condition = '} else if (' + test + ') {'
            }
        }
    })
    var choices = ''
    function slurp (option) {
        return subParse('', variables, name, explode(option.read), depth)
    }
    field.choose.forEach(function (option) {
        choices = $('                                                       \n\
            // __reference__                                                \n\
            ', choices, '                                                   \n\
            ', option.condition, '                                          \n\
                ', slurp(option), '                                         \n\
            // __blank__                                                    \n\
        ')
    })
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

function lengthEncoded (variables, name, field, depth) {
    var source = ''
    var length = qualify('length', depth)
    var object = qualify('object', depth)
    var subObject = qualify('object', depth + 1)
    var i = qualify('i', depth)
    variables.hoist(i)
    variables.hoist(length)
    var looped = nested(variables, field.element, depth + 1)
    return $('                                                              \n\
        ', integer(explode(field.length), length), '                        \n\
        // __blank__                                                        \n\
        for (' + i + ' = 0; ' + i + ' < ' + length + '; ' + i + '++) {      \n\
            ', looped, '                                                    \n\
            // __blank__                                                    \n\
            ' + object + '.' + name + '.push(' + subObject + ')             \n\
        }                                                                   \n\
    ')
}

function subParse (source, variables, name, field, depth) {
    if (field.type === 'alternation') {
        source = $('                                                    \n\
            // __blank__                                                \n\
            ', alternation(variables, name, field, depth), '            \n\
        ')
    } else if (field.length) {
        source = $('                                                    \n\
            // __blank__                                                \n\
            ', lengthEncoded(variables, name, field, depth), '          \n\
        ')
    } else {
        var object = qualify('object', depth)
        field = explode(field)
        if (field.type === 'integer')  {
            source = $('                                                \n\
                ', source, '                                            \n\
                // __blank__                                            \n\
                ', integer(field, object + '.' + name), '               \n\
                // __reference__                                        \n\
            ')
        }
    }
    return source
}

function parse (variables, definition, depth) {
    var source = ''
    for (var name in definition) {
        source = subParse(source, variables, name, definition[name], depth)
    }
    return source
}

function parser (name, definition) {
    var variables = new Variables
    var source = $('                                                        \n\
        ', constructor(variables, definition, 0), '                         \n\
        ', parse(variables, definition, 0), '                               \n\
    ')
    return $('                                                              \n\
        parsers.' + name + ' = function () {                                \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        parsers.' + name + '.prototype.parse = function (engine) {          \n\
            var buffer = engine.buffer                                      \n\
            var start = engine.start                                        \n\
            var end = engine.end                                            \n\
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
        var parsers = {}                                                    \n\
    ')
    Object.keys(definition).forEach(function (packet) {
        source = $('                                                        \n\
            ', source, '                                                    \n\
            // __blank__                                                    \n\
            ', parser(packet, definition[packet]), '                        \n\
        ')
    })
    source = $('                                                            \n\
        ', source, '                                                        \n\
        // __blank__                                                        \n\
        return parsers                                                      \n\
    ')
    return compiler(source)
}
