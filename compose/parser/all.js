var Variables = require('../variables')
var explode = require('../explode')
var qualify = require('../qualify')
var $ = require('programmatic')

var assert = require('assert')

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

function constructor (variables, packet, depth) {
    var fields = [], object = qualify('object', depth)
    variables.hoist(object)
    packet.fields.forEach(function (field) {
        switch (field.type) {
        case 'lengthEncoded':
            fields.push(field.name + ': new Array')
            break
        default:
            fields.push(field.name + ': null')
            break
        }
    })
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

function alternation (variables, packet, depth) {
    var select = qualify('select', depth)
    variables.hoist(select)
    packet.select = explode(packet.select)
    var rewind = packet.select.bytes
    var source = $('                                                        \n\
        ', integer(packet.select, select), '                                 \n\
        start -= ' + rewind + '                                             \n\
    ')
    packet.choose.forEach(function (option, index) {
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
        option.read.name = packet.name
        return subParse('', variables, explode(option.read), depth)
    }
    packet.choose.forEach(function (option) {
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

function lengthEncoded (variables, packet, depth) {
    var source = ''
    var length = qualify('length', depth)
    var object = qualify('object', depth)
    var subObject = qualify('object', depth + 1)
    var i = qualify('i', depth)
    variables.hoist(i)
    variables.hoist(length)
    var looped = nested(variables, packet.element, depth + 1)
    return $('                                                              \n\
        ', integer(explode(packet.length), length), '                       \n\
        // __blank__                                                        \n\
        for (' + i + ' = 0; ' + i + ' < ' + length + '; ' + i + '++) {      \n\
            ', looped, '                                                    \n\
            // __blank__                                                    \n\
            ' + object + '.' + packet.name + '.push(' + subObject + ')       \n\
        }                                                                   \n\
    ')
}

function subParse (source, variables, packet, depth) {
    assert(packet.type)
    switch (packet.type) {
    case 'alternation':
        source = $('                                                    \n\
            // __blank__                                                \n\
            ', alternation(variables, packet, depth), '                 \n\
        ')
        break
    case 'lengthEncoded':
        source = $('                                                    \n\
            // __blank__                                                \n\
            ', lengthEncoded(variables, packet, depth), '               \n\
        ')
        break
    default:
        var object = qualify('object', depth)
        var field = explode(packet)
        if (field.type === 'integer')  {
            source = $('                                                \n\
                ', source, '                                            \n\
                // __blank__                                            \n\
                ', integer(field, object + '.' + field.name), '         \n\
                // __reference__                                        \n\
            ')
        }
        break
    }
    return source
}

function parse (variables, packet, depth) {
    var source = ''
    // todo: switch and this is structure, sub parse is others.
    packet.fields.forEach(function (packet) {
        source = subParse(source, variables, packet, depth)
    })
    return source
}

function parser (packet) {
    var variables = new Variables
    var source = $('                                                        \n\
        ', constructor(variables, packet, 0), '                             \n\
        ', parse(variables, packet, 0), '                                   \n\
    ')
    return $('                                                              \n\
        parsers.' + packet.name + ' = function () {                         \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        parsers.' + packet.name + '.prototype.parse = function (engine) {   \n\
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
    definition.forEach(function (packet) {
        source = $('                                                        \n\
            ', source, '                                                    \n\
            // __blank__                                                    \n\
            ', parser(packet), '                                            \n\
        ')
    })
    source = $('                                                            \n\
        ', source, '                                                        \n\
        // __blank__                                                        \n\
        return parsers                                                      \n\
    ')
    return compiler(source)
}
