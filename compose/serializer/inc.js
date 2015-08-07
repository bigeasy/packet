var Variables = require('../variables')
var explode = require('../explode')
var qualify = require('../qualify')
var $ = require('programmatic')
var joinSources = require('../join-sources')

Generator.prototype.integer = function (field, property) {
    var bites = [], bite = field.bite, stop = field.stop, shift
    while (bite != stop) {
        var value = bite ? 'value >>> ' + bite * 8 : 'value'
        bites.push('buffer[start++] = ' + value + ' & 0xff')
        bite += field.direction
    }
    bites = bites.join('\n')
    var direction = field.little ? '++' : '--'
    return $('                                                              \n\
        case ' + (this.step++) + ':                                         \n\
            // __blank__                                                    \n\
            this.step = ' + this.step + '                                   \n\
            this.bite = ' + field.bite + '                                  \n\
            // __blank__                                                    \n\
        case ' + (this.step++) + ':                                         \n\
            // __blank__                                                    \n\
            while (this.bite != ' + field.stop + ') {                       \n\
                if (start == end) {                                         \n\
                    engine.start = start                                    \n\
                    return                                                  \n\
                }                                                           \n\
                buffer[start++] = ' + property + ' >>> this.bite * 8 & 0xff \n\
                this.bite', direction, '                                    \n\
            }                                                               \n\
            // __blank__                                                    \n\
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
        if (Array.isArray(field)) {
            fields.push(name + ': new Array')
        } else {
            fields.push(name + ': null')
        }
    }
    return fields.join(',\n')
}

Generator.prototype.nested = function (definition) {
    return $('                                                              \n\
        ', this.serialize(definition), '                                    \n\
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
        ', this.integer(explode(field.$length), 'object.' + name + '.length'), '\n\
        // __blank__                                                        \n\
        case ' + (this.step++) + ':                                         \n\
            // __blank__                                                    \n\
            this.stack[this.stack.length - 1].index = 0                     \n\
            this.stack.push({                                               \n\
                object: {                                                   \n\
                    ', this.construct(field, 0), '                          \n\
                }                                                           \n\
            })                                                              \n\
            // __blank__                                                    \n\
        ', this.nested(field), '                                            \n\
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

Generator.prototype.serialize = function (definition) {
    var sources = []
    for (var name in definition) {
        if (name[0] === '$') {
            continue
        }
        var field = definition[name]
        if (Array.isArray(field)) {
            field = field[0]
            if (field.$length) {
                sources.push(this.lengthEncoded(name, field))
            }
        } else {
            var object = qualify('object')
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
    var source = this.serialize(this.definition)
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
        serializers.' + this.name + ' = function (object) {                 \n\
            this.step = 0                                                   \n\
            this.bite = 0                                                   \n\
            this.stop = 0                                                   \n\
            this.stack = [ object ]                                         \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        serializers.' + this.name + '.prototype.serialize = function (engine) { \n\
            var buffer = engine.buffer                                      \n\
            var start = engine.start                                        \n\
            var end = engine.end                                            \n\
            // __blank__                                                    \n\
            var object = this.stack[this.stack.length - 1]                  \n\
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
        var serializers = {}                                                \n\
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
        return serializers                                                      \n\
    ')
    return compiler(source)
}
