var Variables = require('./variables')
var explode = require('./explode')
var qualify = require('./qualify')
var joinSources = require('./join-sources')
var $ = require('programmatic')

function Generator () {
    this.step = 0
}

Generator.prototype.integer = function (field, assignee) {
    field = explode(field)
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
    this.step += 2
    return $('                                                              \n\
        ' + assignee + ' =                                                  \n\
            ', read, '')
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

Generator.prototype.alternation = function (variables, packet, depth) {
    var select = qualify('select', depth)
    variables.hoist(select)
    packet.select = packet.select
    var rewind = packet.select.bytes
    var source = $('                                                        \n\
        ', this.integer(packet.select, select), '                           \n\
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
        option.read.field.name = packet.name
        return this.field(variables, option.read.field, depth)
    }
    packet.choose.forEach(function (option) {
        choices = $('                                                       \n\
            __reference__                                                   \n\
            ', choices, '                                                   \n\
            ', option.condition, '                                          \n\
                __blank__                                                   \n\
                ', slurp.call(this, option), '                              \n\
            __blank__                                                       \n\
        ')
    }, this)
    choices = $('                                                           \n\
        __reference__                                                       \n\
        ', choices, '                                                       \n\
        }                                                                   \n\
    ')
    return $('                                                              \n\
        ', source, '                                                        \n\
        __blank__                                                           \n\
        ', choices, '                                                       \n\
    ')
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
    var looped = this.field(variables, packet.element, depth + 1, true)
    return $('                                                              \n\
        ', this.integer(packet.length, length), '                           \n\
        __blank__                                                           \n\
        for (' + i + ' = 0; ' + i + ' < ' + length + '; ' + i + '++) {      \n\
            ', looped, '                                                    \n\
            __blank__                                                       \n\
            ' + object + '.' + packet.name + '.push(' + subObject + ')      \n\
        }                                                                   \n\
    ')
}

Generator.prototype.checkpoint = function (variables, packet, depth, arrayed) {
    var arrayed = arrayed ? $('                                             \n\
        length: length,                                                     \n\
        index: i,                                                           \n\
    ') : ''
    var separator = '',
        object = 'object',
        stack = 'parser.stack = [{'
        for (var i = -1; i < 0; i++) {
            stack = $('                                                     \n\
                ', stack, '                                                 \n\
                ', separator, '                                             \n\
                __reference__                                               \n\
                    ', arrayed, '                                           \n\
                    object: ' + object + '                                  \n\
            ')
            separator = '}, {'
            object = 'object' + (i + 2)
        }
        stack = $('                                                         \n\
            __reference__                                                   \n\
            ', stack, '                                                     \n\
            }]                                                              \n\
        ')
    return $('                                                              \n\
        if (end - start < ' + packet.length + ') {                          \n\
            var parser = new parsers.inc.' + this.current.name + '          \n\
            parser.step = ' + this.step + '                                 \n\
            ', stack , '                                                    \n\
            parser.object = object                                          \n\
            return { start: start, parser: parser, object: null }           \n\
        }                                                                   \n\
    ')
}

Generator.prototype._condition = function (variables, packet, depth, arrayed) {
    var branches = '', test = 'if'
    packet.conditions.forEach(function (condition) {
        var block = joinSources(condition.fields.map(function (packet) {
            return this.field(variables, explode(packet), depth, arrayed)
        }.bind(this)))
        test = condition.condition == null  ? '} else {' : test + ' (' + condition.condition + ') {'
        branches = $('                                                      \n\
            ', branches, '                                                  \n\
            ' + test + '                                                    \n\
                ', block, '                                                 \n\
        ')
    }, this)
    return $('                                                              \n\
        ', branches, '                                                      \n\
        }                                                                   \n\
    ')
}

Generator.prototype.field = function (variables, packet, depth, arrayed) {
    switch (packet.type) {
    case 'checkpoint':
        return this.checkpoint(variables, packet, depth, arrayed)
    case 'condition':
        return this._condition(variables, packet, depth, arrayed)
    case 'structure':
        return $('                                                          \n\
            ', this._constructor(variables, packet, depth), '               \n\
            __blank__                                                       \n\
            ', joinSources(packet.fields.map(function (packet) {
                return this.field(variables, packet, depth, arrayed)
            }.bind(this))), '                                               \n\
        ')
    case 'alternation':
        return this.alternation(variables, packet, depth)
    case 'lengthEncoded':
        return this.lengthEncoded(variables, packet, depth)
    default:
        var object = qualify('object', depth)
        if (packet.type === 'integer')  {
            return $('                                                      \n\
                ', this.integer(packet, object + '.' + packet.name), '      \n\
                __reference__                                               \n\
            ')
        }
        break
    }
    return source
}

Generator.prototype.parser = function (packet, bff) {
    this.current = { name: packet.name }

    var variables = new Variables

    var source = this.field(variables, packet, 0, false)

    // No need to track the end if we are a whole packet parser.
    var signature = [ 'buffer', 'start', 'end' ]
    if (!bff) signature.pop()
    signature = signature.join(', ')


    var object = 'parsers.' + (bff ? 'bff' : 'all') + '.' + packet.name

    var inc = bff ? $('                                                     \n\
        __blank__                                                           \n\
        parsers.bff._inc = function (buffer, start, end, stack) {           \n\
            var parser = new parsers.inc.' + packet.name + '                \n\
            return 1                                                        \n\
        }                                                                   \n\
    ') : ''

    // Parser defintion body.
    return $('                                                              \n\
        ' + object + ' = function () {                                      \n\
        }                                                                   \n\
        ', inc, '                                                           \n\
        __blank__                                                           \n\
        ' + object + '.prototype.parse = function (' + signature + ') {     \n\
            __blank__                                                       \n\
            ', String(variables), '                                         \n\
            __blank__                                                       \n\
            ', source, '                                                    \n\
            __blank__                                                       \n\
            return { start: start, object: object, parser: null }           \n\
        }                                                                   \n\
    ')
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
