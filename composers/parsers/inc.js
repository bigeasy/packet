var $ = require('programmatic')
var signage = require('./signage')
var unpackAll = require('./unpack')

function composeIncrementalParser (ranges) {
    var variables = [], source = '', previous = ''

    ranges.forEach(function (range, rangeIndex) {
        range.pattern.forEach(function (field, fieldIndex) {
            var step = field.index * 2

            var little = field.endianness == 'l'
            var bytes = field.bytes
            var bite = little ? 0 : bytes - 1
            var direction = little ? 'bite++' : 'bite--'
            var stop = little ? bytes : -1

            var variable = 'value'
            var parseStep = step + 1
            var fixup = '', assign

            var fetch = ''
            if (range.lengthEncoded) {
                fetch = $('                                                 \n\
                    array = object.' + field.name + '                       \n\
                ')
            } else if (field.arrayed) {
                fetch = 'array = new Array(' + field.repeat + ')'
            }

            var initialization, fixup, assignee = variable
            if (field.endianness == 'x') {
                hoist('skip')
                hoist('remaining')
                source = $('                                                \n\
                    ', source, '                                            \n\
                    case ' + step + ':                                      \n\
                        skip = ' + (field.bytes * field.repeat) + '         \n\
                        step = ' + (step + 1) + '                           \n\
                    case ' + (step + 1) + ':                                \n\
                        remaining = end - start                             \n\
                        if (remaining < skip) {                             \n\
                            skip -= remaining                               \n\
                            return end                                      \n\
                        }                                                   \n\
                        start += skip                                       \n\
                ')
            } else {
                if (field.type == 'f') {
                    hoist('value')
                    initialization = $('                                        \n\
                        ' + variable + ' = new ArrayBuffer(' + field.bytes + ') \n\
                    ')
                    fixup = $('                                                 \n\
                        ' + variable + ' = new DataView(' +
                            variable + ').getFloat' +
                                field.bits + '(0, true)                         \n\
                    ')
                    assign = '[bite] = buffer[start++]'
                } else if (field.arrayed) {
                    initialization = $('\n\
                        if (array.length !== 0) {                               \n\
                            array[0] = 0                                        \n\
                        }                                                       \n\
                        i = 0                                                   \n\
                    ')
                    assignee = 'array[i]'
                    assign = ' += Math.pow(256, bite) * buffer[start++]'
                } else {
                    if (field.lengthEncoding) {
                        initialization = 'length = 0'
                        assignee = 'length'
                    } else {
                        initialization = variable + ' = 0'
                    }
                    hoist(variable)
                    fixup = signage(field)
                    assign = ' += Math.pow(256, bite) * buffer[start++]'
                }

                hoist('bite')
                hoist('next')

                if (field.arrayed) {
                    hoist('i')
                }

                var parse = $('                                                 \n\
                        while (bite != ' + stop + ') {                          \n\
                            if (start == end) {                                 \n\
                                return start                                    \n\
                            }                                                   \n\
                            ' + assignee + assign + '                           \n\
                            ' + direction + '                                   \n\
                        }                                                       \n\
                ')

                if (field.arrayed) {
                    parse = $('                                                 \n\
                        for (;;) {                                              \n\
                            ', parse, '                                         \n\
                            if (++i === array.length) {                         \n\
                                break                                           \n\
                            }                                                   \n\
                            ' + assignee + ' = 0                                \n\
                            bite = ' + bite + '                                 \n\
                        }                                                       \n\
                    ')
                }

                source = $('                                                    \n\
                    ', source, '                                                \n\
                    case ' + step + ':                                          \n\
                        ', fetch, '                                             \n\
                        ', initialization, '                                    \n\
                        bite = ' + bite + '                                     \n\
                        step = ' + parseStep + '                                \n\
                    case ' + parseStep + ':                                     \n\
                        ', parse, '                                             \n\
                ')

                // sign fixup
                source = $('                                                    \n\
                    // __reference__                                            \n\
                    ', previous , '                                             \n\
                    ', source, '                                                \n\
                        ', fixup)
                if (field.packing) {
                    // TODO: Not sure why indent is necessary.
                    source = $('                                                \n\
                        // __reference__                                        \n\
                        ', source, '                                            \n\
                            ', unpackAll(field, source) + '                     \n\
                    ')
                } else if (field.lengthEncoding) {
                    source = $('                                                \n\
                        // __reference__                                        \n\
                        ', source, '                                            \n\
                            object.' + range.name + ' = new Array(length)       \n\
                    ')
                } else if (!field.arrayed) {
                    source = $('                                                \n\
                        // __reference__                                        \n\
                        ', source, '                                            \n\
                            object.' + field.name + ' = ' + variable + '       \n\
                    ')
                }
            }
        })
    })

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
