var $ = require('programmatic')
var signage = require('./signage')
var unpackAll = require('./unpack')

function parseInit (field) {
    var little = field.endianness == 'l'
    var bytes = field.bytes
    var bite = little ? 0 : bytes - 1
    return 'bite = ' + bite
}

function parseLoop (field, assign) {
    var little = field.endianness == 'l'
    var bytes = field.bytes
    var bite = little ? 0 : bytes - 1
    var direction = little ? 'bite++' : 'bite--'
    var stop = little ? bytes : -1
    return $('                                                              \n\
            while (bite != ' + stop + ') {                                  \n\
                if (start == end) {                                         \n\
                    return start                                            \n\
                }                                                           \n\
                ' + assign + '                                              \n\
                ' + direction + '                                           \n\
            }                                                               \n\
    ')
}

var formatters = {
    skip: function (hoist, source, vars) {
        var field = vars.field
        hoist('skip')
        hoist('remaining')
        return $('                                                          \n\
            ', source, '                                                    \n\
            case ' + vars.step + ':                                         \n\
                skip = ' + (field.bytes * field.repeat) + '                 \n\
                step = ' + (vars.step + 1) + '                              \n\
            case ' + (vars.step + 1) + ':                                   \n\
                remaining = end - start                                     \n\
                if (remaining < skip) {                                     \n\
                    skip -= remaining                                       \n\
                    return end                                              \n\
                }                                                           \n\
                start += skip                                               \n\
        ')
    },
    float:  function (hoist, source, vars) {
        var field = vars.field
        hoist('value')
        hoist('bite')
        return $('                                                          \n\
            ', source, '                                                    \n\
            case ' + vars.step + ':                                         \n\
                value = new ArrayBuffer(' + field.bytes + ')                \n\
                ', parseInit(field), '                                      \n\
                step = ' + (vars.step + 1) + '                              \n\
            case ' + (vars.step + 1) + ':                                   \n\
                ', parseLoop(field, 'value[bite] = buffer[start++]'), '                 \n\
                ' + vars.assign + ' = new DataView(value).getFloat' + field.bits + '(0, true)   \n\
        ')
    },
    integer: function (hoist, source, vars) {
        var step = vars.step
        var field = vars.field
        var little = field.endianness == 'l'
        var bytes = field.bytes
        var bite = little ? 0 : bytes - 1
        var direction = little ? 'bite++' : 'bite--'
        var stop = little ? bytes : -1

        var variable = 'value'
        var parseStep = step + 1
        var fixup = '', assign

        var initialization = variable + ' = 0'
        hoist(variable)
        fixup = signage(field)
        assign = ' += Math.pow(256, bite) * buffer[start++]'

        hoist('bite')
        hoist('next')

        var parse = $('                                                     \n\
                while (bite != ' + stop + ') {                              \n\
                    if (start == end) {                                     \n\
                        return start                                        \n\
                    }                                                       \n\
                    value' + assign + '                               \n\
                    ' + direction + '                                       \n\
                }                                                           \n\
        ')

        source = $('                                                        \n\
            ', source, '                                                    \n\
            case ' + step + ':                                              \n\
                ', initialization, '                                        \n\
                bite = ' + bite + '                                         \n\
                step = ' + parseStep + '                                    \n\
            case ' + parseStep + ':                                         \n\
                ', parse, '                                                 \n\
        ')

        // sign fixup
        source = $('                                                        \n\
            // __reference__                                                \n\
            ', source, '                                                    \n\
                ', fixup)
        if (field.packing) {
            // TODO: Not sure why indent is necessary.
            return $('                                                      \n\
                // __reference__                                            \n\
                ', source, '                                                \n\
                    ', unpackAll(field, source) + '                         \n\
            ')
        } else {
            return $('                                                      \n\
                // __reference__                                            \n\
                ', source, '                                                \n\
                    object.' + field.name + ' = ' + variable + '            \n\
            ')
        }
    }
}

function composeIncrementalParser (ranges) {
    var variables = [], source = ''

    ranges.forEach(function (range, rangeIndex) {
        range.pattern.forEach(function (field, fieldIndex) {
            var step = field.index * 2
            if (field.endianness == 'x') {
                source = formatters.skip(hoist, source, { step: step, field: field })
            } else if (field.type == 'f') {
                source = formatters.float(hoist, source, { step: step, field: field, assign: 'object.' + field.name })
            } else {
                source = formatters.integer(hoist, source, { step: step, field: field, assign: 'object.' + field.name })
            }
        })
    })

    hoist('next')

    source = $('                                                            \n\
    this.parse = function (buffer, start, end) {                            \n\
        switch (step) {                                                     \n\
        ', source, '                                                        \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        if (next = callback(object)) {                                      \n\
            this.parse = next                                               \n\
            return this.parse(buffer, start, end)                           \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        return start                                                        \n\
    }                                                                       \n\
    // __blank__                                                            \n\
    return this.parse(buffer, start, end)                                   \n\
    ')

    var vars = variables.map(function (variable) {
        return 'var ' + variable + '\n'
    })

    var out = $('                                                           \n\
        var inc                                                             \n\
        // __blank__                                                        \n\
        inc = function (buffer, start, end, step) {                         \n\
            ', $.apply(null, vars), '                                       \n\
            // __blank__                                                    \n\
            ', source, '                                                    \n\
        }                                                                   \n\
        ')

    return out

    function hoist (variable) {
        if (variables.indexOf(variable) === -1) {
            variables.push(variable)
        }
    }
}

module.exports = composeIncrementalParser
