var Variables = require('../variables')
var explode = require('../explode')
var qualify = require('../qualify')
var $ = require('programmatic')
var joinSources = require('../join-sources')

Generator.prototype.integer = function (field, property) {
    var step = this.step, bites = [], bite = field.bite, stop = field.stop, shift
    while (bite != stop) {
        var value = bite ? 'value >>> ' + bite * 8 : 'value'
        bites.push('buffer[start++] = ' + value + ' & 0xff')
        bite += field.direction
    }
    bites = bites.join('\n')
    var direction = field.little ? '++' : '--'
    var source = $('                                                        \n\
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
    ')
    return { step: step, source: source }
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

Generator.prototype.alternation = function (name, field) {
    var step = this.step++
    this.forever = true
    field.choose.forEach(function (choice, index) {
        var when = choice.write.when || {}, test
        if (when.range != null) {
            var range = []
            if (when.range.from) {
                range.push(when.range.from + ' <= frame.object.' + name)
            }
            if (when.range.to) {
                range.push('frame.object.' + name + ' < ' + when.range.to)
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
    var sources = [], dispatch = ''
    field.choose.forEach(function (choice) {
        var compiled = this.subSerialize(name, choice.read)
        dispatch = $('                                                      \n\
            // __reference__                                                \n\
            ', dispatch, '                                                  \n\
            ', choice.condition, '                                          \n\
            // __blank__                                                    \n\
                this.step = ' + compiled.step + '                           \n\
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
    var source = $('                                                        \n\
        case ' + step + ':                                                  \n\
            // __blank__                                                    \n\
            frame = this.stack[this.stack.length - 1]                       \n\
            // __blank__                                                    \n\
            ', dispatch, '                                                  \n\
            }                                                               \n\
        // __blank__                                                        \n\
        ', steps, '                                                         \n\
    ')
    return { step: step, source: source }
}

Generator.prototype.lengthEncoded = function (name, field) {
    var source = ''
    this.forever = true
    var step = this.step
    var again = this.step + 2
    source = $('                                                            \n\
        // __reference__                                                    \n\
        ', this.integer(explode(field.length), 'frame.object.' + name + '.length').source, '\n\
            // __blank__                                                    \n\
            this.step = ' + again + '                                       \n\
        // __blank__                                                        \n\
        case ' + (this.step++) + ':                                         \n\
            // __blank__                                                    \n\
            this.stack.push(frame = {                                       \n\
                object: frame.object.' + name + '[frame.index],             \n\
                index: 0                                                    \n\
            })                                         \n\
            this.step = ' + this.step + '                                   \n\
            // __blank__                                                    \n\
        ', this.nested(field.element), '                                    \n\
            // __blank__                                                    \n\
            this.stack.pop()                                                \n\
            frame = this.stack[this.stack.length - 1]                       \n\
            if (++frame.index != frame.object.' + name + '.length) {        \n\
                this.step = ' + again + '                                   \n\
                continue                                                    \n\
            }                                                               \n\
    ')
    return { step: step, source: source }
}

Generator.prototype.subSerialize = function (name, field) {
    if (field.type == 'alternation') {
        return this.alternation(name, field)
    } else if (field.length) {
        return this.lengthEncoded(name, field)
    } else {
        field = explode(field)
        if (field.type === 'integer')  {
            return this.integer(field, 'frame.object.' + name)
        }
    }
}

Generator.prototype.serialize = function (definition) {
    var sources = []
    for (var name in definition) {
        var source = this.subSerialize(name, definition[name]).source
        sources.push($('                                                    \n\
            // __reference__                                                \n\
            ', source, '                                                    \n\
                this.step = ' + this.step + '                               \n\
        '))
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
        case ' + this.step + ':                                             \n\
            // __blank__                                                    \n\
            engine.start = start                                            \n\
            // __blank__                                                    \n\
        }                                                                   \n\
    ')
    if (this.forever) {
        dispatch = $('                                                      \n\
            for (;;) {                                                      \n\
                ', dispatch, '                                              \n\
                break                                                       \n\
            }                                                               \n\
        ')
    }
    return $('                                                              \n\
        serializers.' + this.name + ' = function (object) {                 \n\
            this.step = 0                                                   \n\
            this.bite = 0                                                   \n\
            this.stop = 0                                                   \n\
            this.stack = [{                                                 \n\
                object: object,                                             \n\
                index: 0,                                                   \n\
                length: 0                                                   \n\
            }]                                                              \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        serializers.' + this.name + '.prototype.serialize = function (engine) { \n\
            var buffer = engine.buffer                                      \n\
            var start = engine.start                                        \n\
            var end = engine.end                                            \n\
            // __blank__                                                    \n\
            var frame = this.stack[this.stack.length - 1]                   \n\
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
