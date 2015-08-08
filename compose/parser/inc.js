var Variables = require('../variables')
var explode = require('../explode')
var qualify = require('../qualify')
var $ = require('programmatic')
var joinSources = require('../join-sources')

Generator.prototype.integer = function (field, property) {
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
    field = explode(field)
    var direction = field.little ? '++' : '--'
    return $('                                                              \n\
        case ' + (this.step++) + ':                                         \n\
            // __blank__                                                    \n\
            this.stack.push({                                               \n\
                value: 0,                                                   \n\
                bite: ' + field.bite + '                                    \n\
            })                                                              \n\
            this.step = ' + this.step + '                                   \n\
            // __blank__                                                    \n\
        case ' + (this.step++) + ':                                         \n\
            // __blank__                                                    \n\
            frame = this.stack[this.stack.length - 1]                       \n\
            // __blank__                                                    \n\
            while (frame.bite != ' + stop + ') {                            \n\
                if (start == end) {                                         \n\
                    engine.start = start                                    \n\
                    return                                                  \n\
                }                                                           \n\
                frame.value += Math.pow(256, frame.bite) * buffer[start++]  \n\
                frame.bite', direction, '                                   \n\
            }                                                               \n\
            // __blank__                                                    \n\
            this.stack.pop()                                                \n\
            this.stack[this.stack.length - 1].' + property + ' = frame.value\n\
            this.step = ' + this.step + '                                   \n\
    ')
}

Generator.prototype.construct = function (definition) {
    var fields = []
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
    return fields.join(',\n')
}

Generator.prototype.nested = function (definition, depth) {
    return $('                                                              \n\
        ', this.parse(definition, depth), '                                 \n\
    ')
}

Generator.prototype.lengthEncoded = function (name, field, depth) {
    var source = ''
    var length = qualify('length', depth)
    var object = qualify('object', depth)
    var subObject = qualify('object', depth + 1)
    var i = qualify('i', depth)
    this.variables.hoist(i)
    this.variables.hoist(length)
    this.forever = true
    var step = this.step + 2
    source = $('                                                            \n\
        ', this.integer(explode(field.length), 'length'), '                 \n\
        // __blank__                                                        \n\
        case ' + (this.step++) + ':                                         \n\
            // __blank__                                                    \n\
            this.stack[this.stack.length - 1].index = 0                     \n\
            this.stack.push({                                               \n\
                object: {                                                   \n\
                    ', this.construct(field.element, 0), '                  \n\
                }                                                           \n\
            })                                                              \n\
            // __blank__                                                    \n\
        ', this.nested(field.element), '                                    \n\
            // __blank__                                                    \n\
            frame = this.stack[this.stack.length - 2]                       \n\
            frame.object.' + name + '.push(this.stack.pop().object)         \n\
            if (++frame.index != frame.length) {                            \n\
                this.step = ' + step + '                                    \n\
                continue                                                    \n\
            }                                                               \n\
    ')
    return source
}

Generator.prototype.parse = function (definition, depth) {
    var sources = []
    for (var name in definition) {
        if (name[0] === '$') {
            continue
        }
        var field = definition[name]
        if (field.length) {
            if (field.length) {
                sources.push(this.lengthEncoded(name, field, depth))
            }
        } else {
            var object = qualify('object', depth)
            field = explode(field)
            if (field.type === 'integer')  {
                sources.push(this.integer(field, object + '.' + name))
            }
        }
    }
    return joinSources(sources)
}

function parser (name, definition) {
    return new Generator(name, definition).generate()
}

function Generator (name, definition) {
    this.step = 0
    this.name = name
    this.definition = definition
    this.variables = new Variables
}

Generator.prototype.generate = function () {
    var source = this.parse(this.definition, 0)
    var dispatch = $('                                                      \n\
        switch (this.step) {                                                \n\
        ', source, '                                                        \n\
        }                                                                   \n\
    ')
    if (this.forever) {
        dispatch = $('                                                      \n\
            for (;;) {                                                      \n\
                ', dispatch, '                                              \n\
                return                                                      \n\
            }                                                               \n\
        ')
    }
    return $('                                                              \n\
        parsers.' + this.name + ' = function () {                           \n\
            this.step = 0                                                   \n\
            this.stack = [{                                                 \n\
                object: this.object = {                                     \n\
                    ', this.construct(this.definition), '                   \n\
                },                                                          \n\
                array: null,                                                \n\
                index: 0,                                                   \n\
                length: 0                                                   \n\
            }]                                                              \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        parsers.' + this.name + '.prototype.parse = function (engine) {     \n\
            var buffer = engine.buffer                                      \n\
            var start = engine.start                                        \n\
            var end = engine.end                                            \n\
            // __blank__                                                    \n\
            var frame = this.stack[this.stack.length - 1]                   \n\
            // __blank__                                                    \n\
            ', String(this.variables), '                                    \n\
            // __blank__                                                    \n\
            ', dispatch, '                                                  \n\
            // __blank__                                                    \n\
            engine.start = start                                            \n\
            // __blank__                                                    \n\
            return frame.object                                             \n\
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
