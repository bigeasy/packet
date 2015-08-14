var Variables = require('../variables')
var explode = require('../explode')
var qualify = require('../qualify')
var $ = require('programmatic')
var joinSources = require('../join-sources')

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
    field = explode(field)
    var direction = field.little ? '++' : '--'
    var source = $('                                                        \n\
        case ' + (this.step++) + ':                                         \n\
            // __blank__                                                    \n\
            ' + when(cached, 'this.cache = []') + '                         \n\
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
                ' + when(cached, 'this.cache.push(buffer[start])') + '      \n\
                frame.value += Math.pow(256, frame.bite) * buffer[start++]  \n\
                frame.bite', direction, '                                   \n\
            }                                                               \n\
            // __blank__                                                    \n\
            this.stack.pop()                                                \n\
            this.stack[this.stack.length - 1].' + property + ' = frame.value\n\
    ')
    return {
        step: step,
        source: source
    }
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

Generator.prototype.alternation = function (name, field, depth) {
    var step = this.step
    this.forever = true
    var integer = this.integer(explode(field.select), 'select', true)
    var source = integer.source
    field.choose.forEach(function (choice, index) {
        var when = choice.read.when || {}, test
        if (when.and != null) {
            test = 'frame.select & 0x' + when.and.toString(16)
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
    var sources = [], dispatch = ''
    field.choose.forEach(function (option) {
        var compiled = this.subParse(name, option.read)
        dispatch = $('                                                      \n\
            // __reference__                                                \n\
            ', dispatch, '                                                  \n\
            ', option.condition, '                                          \n\
            // __blank__                                                    \n\
                this.step = ' + compiled.step + '                           \n\
                this.parse({                                                \n\
                    buffer: this.cache,                                     \n\
                    start: 0,                                               \n\
                    end: this.cache.length                                  \n\
                })                                                          \n\
                continue                                                    \n\
                // __blank__                                                \n\
        ')
        sources.push(compiled.source)
    }, this)
    var steps = ''
    sources.forEach(function (source) {
        steps = $('                                                         \n\
            // __reference__                                                \n\
            ', steps, '                                                     \n\
            ', source, '                                                    \n\
                this.step = ' + this.step + '                               \n\
            // __blank__                                                    \n\
        ')
    }, this)
    source = $('                                                            \n\
        // __reference__                                                    \n\
        ', source, '                                                        \n\
            frame = this.stack[this.stack.length - 1]                       \n\
            // __blank__                                                    \n\
            ', dispatch, '                                                  \n\
            }                                                               \n\
        // __blank__                                                        \n\
        ', steps, '                                                         \n\
    ')
    return {
        step: integer.step,
        source: source
    }
}

Generator.prototype.lengthEncoded = function (name, field, depth) {
    var source = ''
    this.forever = true
    var integer = this.integer(explode(field.length), 'length')
    var again = this.step
    source = $('                                                            \n\
        // __reference__                                                    \n\
        ', integer.source, '                                                \n\
        // __blank__                                                        \n\
            this.stack[this.stack.length - 1].index = 0                     \n\
        // __blank__                                                        \n\
        case ' + (this.step++) + ':                                         \n\
            // __blank__                                                    \n\
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
                this.step = ' + again + '                                   \n\
                continue                                                    \n\
            }                                                               \n\
    ')
    return {
        step: integer.step,
        source: source
    }
}

Generator.prototype.subParse = function (name, field) {
    if (field.type == 'alternation') {
        return this.alternation(name, field)
    } else if (field.length) {
        return this.lengthEncoded(name, field)
    } else {
        var object = 'object'
        field = explode(field)
        if (field.type === 'integer')  {
            return this.integer(field, object + '.' + name)
        }
    }
}

Generator.prototype.parse = function (definition, depth) {
    var sources = []
    for (var name in definition) {
        sources.push(this.subParse(name, definition[name]).source)
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
        case ' + this.step + ':                                             \n\
            // __blank__                                                    \n\
            engine.start = start                                            \n\
            // __blank__                                                    \n\
        }                                                                   \n\
    ')
    if (this.forever) {
        dispatch = $('                                                      \n\
            for (;;) {                                                      \n\
                // __blank__                                                \n\
                ', dispatch, '                                              \n\
                // __blank__                                                \n\
                break                                                       \n\
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
            ' + when(this.cached, 'this.cache = null') + '                  \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        parsers.' + this.name + '.prototype.parse = function (engine) {     \n\
            var buffer = engine.buffer                                      \n\
            var start = engine.start                                        \n\
            var end = engine.end                                            \n\
            // __blank__                                                    \n\
            var frame = this.stack[this.stack.length - 1]                   \n\
            // __blank__                                                    \n\
            ', dispatch, '                                                  \n\
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
