var Variables = require('./variables')
var explode = require('./explode')
var qualify = require('./qualify')
var joinSources = require('./join-sources')
var unpackAll = require('./unpack')
var $ = require('programmatic')

function Generator () {
    this.step = 0
    this.variables = new Variables
}

function when (condition, source) {
    return condition ? source : ''
}

Generator.prototype.integer = function (field, property, cached) {
    var read = [], bite = field.bite, stop = field.stop, step = this.step
    while (bite != stop) {
        read.unshift('buffer[start++]')
        if (bite) {
            read[0] += ' * 0x' + Math.pow(256, bite).toString(16)
        }
        bite += field.direction
    }
    if (cached) {
        this.cached = true
    }
    read = read.reverse().join(' + \n')
    var direction = field.little ? '++' : '--'
    var assignment
    if (field.fields) {
        this.variables.hoist('object')
        this.variables.hoist('value')
        assignment = $('                                                    \n\
            value = frame.value                                             \n\
            __blank__                                                       \n\
            ', unpackAll('this.stack[this.stack.length - 1].' + property, field), '                                \n\
        ')
    } else {
        assignment = $('                                                    \n\
            this.stack[this.stack.length - 1].' + property + ' = frame.value\n\
        ')
    }
    var source = $('                                                        \n\
        case ' + (this.step++) + ':                                         \n\
            __blank__                                                       \n\
            ' + when(cached, 'this.cache = []') + '                         \n\
            this.stack.push({                                               \n\
                value: 0,                                                   \n\
                bite: ' + field.bite + '                                    \n\
            })                                                              \n\
            this.step = ' + this.step + '                                   \n\
            __blank__                                                       \n\
        case ' + (this.step++) + ':                                         \n\
            __blank__                                                       \n\
            frame = this.stack[this.stack.length - 1]                       \n\
            __blank__                                                       \n\
            while (frame.bite != ' + stop + ') {                            \n\
                if (start == end) {                                         \n\
                    return { start: start, object: null, parser: this }     \n\
                }                                                           \n\
                ' + when(cached, 'this.cache.push(buffer[start])') + '      \n\
                frame.value += Math.pow(256, frame.bite) * buffer[start++]  \n\
                frame.bite', direction, '                                   \n\
            }                                                               \n\
            __blank__                                                       \n\
            this.stack.pop()                                                \n\
            __blank__                                                       \n\
            ', assignment, '                                                \n\
            __blank__                                                       \n\
    ')
    return {
        step: step,
        source: source
    }
}

Generator.prototype.construct = function (packet) {
    var fields = []
    // TODO Not always a structure, sometimes it is an object.
    if (packet.type == 'structure') {
        packet.fields.forEach(function (packet) {
            switch (packet.type) {
            case 'integer':
                if (packet.name) {
                    fields.push(packet.name + ': null')
                } else if (packet.fields) {
                    packet.fields.forEach(function (packet) {
                        fields.push(packet.name + ': null')
                    })
                }
                break
            case 'lengthEncoded':
                fields.push(packet.name + ': new Array')
                break
            }
        }, this)
    } else {
        throw new Error('to do')
    }
    return fields.join(',\n')
}

Generator.prototype.condition = function (packet, depth) {
    var step = this.step
    this.forever = true
    this.variables.hoist('object')
    var choices = packet.conditions.map(function (condition, index) {
        var test = condition.test
        var choice = { fields: condition.fields, test: condition.test }
        choice.condition = '} else {'
        if (choice.test) {
            if (index === 0) {
                choice.condition = 'if (' + test + ') {'
            } else {
                choice.condition = '} else if (' + test + ') {'
            }
        }
        return choice
    })
    var sources = [], dispatch = '', step
    choices.forEach(function (choice) {
        var source = ''
        var step = this.stop
        // TODO Make this some sort of block type.
        choice.fields.forEach(function (packet) {
            var got = this.field(explode(packet))
            step = got.step
            source = $('                                                    \n\
                ', got.source, '                                            \n\
            ')
        }, this)
        dispatch = $('                                                      \n\
            __reference__                                                   \n\
            ', dispatch, '                                                  \n\
            ', choice.condition, '                                          \n\
            __blank__                                                       \n\
                this.step = ' + step + '                                    \n\
                continue                                                    \n\
                __blank__                                                   \n\
        ')
        sources.push(source)
    }, this)
    var steps = ''
    sources.forEach(function (source) {
        steps = $('                                                         \n\
            __reference__                                                   \n\
            ', steps, '                                                     \n\
            ', source, '                                                    \n\
                this.step = ' + this.step + '                               \n\
                continue                                                    \n\
            __blank__                                                       \n\
        ')
    }, this)
    var source = $('                                                        \n\
        __reference__                                                       \n\
            frame = this.stack[this.stack.length - 1]                       \n\
            object = this.stack[0].object                                   \n\
            __blank__                                                       \n\
            ', dispatch, '                                                  \n\
            }                                                               \n\
        __blank__                                                           \n\
        ', steps, '                                                         \n\
    ')
    return {
        step: step,
        source: source
    }
}

Generator.prototype.lengthEncoded = function (packet, depth) {
    var source = ''
    this.forever = true
    var integer = this.integer(packet.length, 'length')
    var again = this.step
    source = $('                                                            \n\
        __reference__                                                       \n\
        ', integer.source, '                                                \n\
        __blank__                                                           \n\
            this.stack[this.stack.length - 1].index = 0                     \n\
        ', this.field(packet.element), '                                    \n\
            __blank__                                                       \n\
            frame = this.stack[this.stack.length - 2]                       \n\
            frame.object.' + packet.name + '.push(this.stack.pop().object)  \n\
            if (++frame.index != frame.length) {                            \n\
                this.step = ' + again + '                                   \n\
                continue                                                    \n\
            }                                                               \n\
            this.step = ' + this.step + '                                   \n\
            __blank__                                                       \n\
    ')
    return {
        step: integer.step,
        source: source
    }
}

Generator.prototype.field = function (packet, depth, caseless) {
    switch (packet.type) {
    case 'structure':
        var push = $('                                                      \n\
            case ' + (this.step++) + ':                                     \n\
                __blank__                                                   \n\
                this.stack.push({                                           \n\
                    object: {                                               \n\
                        ', this.construct(packet, 0), '                     \n\
                    }                                                       \n\
                })                                                          \n\
                this.stack[this.stack.length - 2].object.' + packet.name +
                    ' = this.stack[this.stack.length - 1].object            \n\
                this.step = ' + this.step + '                               \n\
                __blank__                                                   \n\
        ')
        var source =  joinSources(packet.fields.map(function (packet) {
            return this.field(packet, 0).source
        }.bind(this)))
        return {
            source: $('                                                     \n\
                ', push, '                                                  \n\
                ', source, '                                                \n\
            ')
        }
    case 'condition':
        return this.condition(packet)
    case 'lengthEncoded':
        return this.lengthEncoded(packet)
    default:
        var object = 'object'
        if (packet.type === 'integer')  {
            return this.integer(packet, packet.fields ? object : object + '.' + packet.name, caseless)
        }
    }
}

Generator.prototype.parser = function (packet) {
    var source = this.field(packet, 0).source
    var dispatch = $('                                                      \n\
        switch (this.step) {                                                \n\
        ', source, '                                                        \n\
        case ' + this.step + ':                                             \n\
            __blank__                                                       \n\
            return {                                                        \n\
                start: start,                                               \n\
                object: this.stack[0].object.object,                        \n\
                parser: null                                                \n\
            }                                                               \n\
            __blank__                                                       \n\
        }                                                                   \n\
    ')
    if (this.forever) {
        dispatch = $('                                                      \n\
            for (;;) {                                                      \n\
                __blank__                                                   \n\
                ', dispatch, '                                              \n\
                __blank__                                                   \n\
                break                                                       \n\
            }                                                               \n\
        ')
    }
    var object = 'parsers.inc.' + packet.name
    return $('                                                              \n\
        ' + object + ' = function () {                                      \n\
            this.step = 0                                                   \n\
            this.stack = [{                                                 \n\
                object: { object: null }                                    \n\
            }]                                                              \n\
            ' + when(this.cached, 'this.cache = null') + '                  \n\
        }                                                                   \n\
        __blank__                                                           \n\
        ' + object + '.prototype.parse = function (buffer, start, end) {    \n\
            ', String(this.variables), '                                    \n\
            var frame = this.stack[this.stack.length - 1]                   \n\
            __blank__                                                       \n\
            ', dispatch, '                                                  \n\
        }                                                                   \n\
    ')
}

module.exports = function (compiler, definition) {
    var source = joinSources(definition.map(function (packet) {
        return new Generator().parser(explode(packet))
    }))
    source = $('                                                            \n\
        ', source, '                                                        \n\
    ')
    return compiler(source)
}
