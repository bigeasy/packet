var $ = require('programmatic')
var signage = require('./signage')
var composeIncrementalParser = require('./inc')
var unpackAll = require('./unpack')

var formatters = {
    blank: function (source) {
        return $('                                                          \n\
            ', source, '                                                    \n\
            // __blank__                                                    \n\
        ')
    },
    range: function (source, vars) {
        return $('                                                          \n\
            ', source, '                                                    \n\
            if (end - start < ' + vars.sentry + ') {                        \n\
                return inc.call(this, buffer, start, end, ' + vars.step + ')\n\
            }                                                               \n\
            // __blank__                                                    \n\
        ')
    }
}

function composeParser (ranges) {
    composeIncrementalParser(ranges)

    var source = '', variables = [ 'next' ], rangeIndex = 0, source = '', step = 0

    ranges.forEach(function (range, rangeIndex) {
        if (rangeIndex) {
            source = formatters.blank(source)
        }

        source = formatters.range(source, {
            sentry: range.fixed ? range.size : 'value',
            step: step
        })

        var offset = 0
        range.pattern.forEach(function (field, index) {
            step += 2
            if (field.endianness == 'x') {
                var skip = field.bytes * field.repeat
                offset += skip
                source = $('                                                \n\
                    ', source, '                                            \n\
                    start += ' + skip + '                                   \n\
                    // __blank__                                            \n\
                ')
            } else if (field.bytes == 1 && ! field.signed) {
                source = $('                                                \n\
                    ', source, '                                            \n\
                    object.' + field.name + ' = buffer[start++]             \n\
                ')
                offset++
            } else {
                var name = 'value'
                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bite = little ? 0 : bytes - 1
                var direction = little ? 1 : -1
                var stop = little ? bytes : -1
                var index = little ? 0 : bytes - 1

                if (field.type == 'f') {
                    variables.push(name)

                    var copy = [], inc
                    while (bite != stop) {
                        copy.push(
                            name +
                            '[' +
                                index +
                            '] = buffer[start++]')
                        offset++
                        index += direction
                        bite += direction
                    }
                    copy = copy.join('\n')

                    source = $('                                                \n\
                        ', source, '                                            \n\
                        ' + name + ' = new ArrayBuffer(' + field.bytes + ')     \n\
                        ', copy, '                                              \n\
                        object.' + field.name + ' = new DataView(' +
                                name +
                            ').getFloat' +
                                field.bits +
                            '(0, true)                                          \n\
                    ')
                } else {
                    var piece = ''
                    var read = [], inc = ''
                    while (bite != stop) {
                        read.unshift('buffer[start++]')
                        if (bite) {
                            read[0] += ' * 0x' + Math.pow(256, bite).toString(16)
                        }
                        offset++
                        bite += direction
                    }
                    read = read.reverse().join(' + \n')
                    if (field.packing || field.signed) {
                        var variable = 'value'
                        variables.push(variable)
                        if (field.bytes == 1) {
                            var assignment = $(variable + ' = ' + read)
                        } else {
                            var assignment = $('\n\
                                ' + variable + ' =                          \n\
                                    ', read, '')
                        }
                        source = $('                                        \n\
                            ', source, '                                    \n\
                            ', assignment, '                                \n\
                            ', signage(field), '                            \n\
                        ')
                        if (field.packing) {
                            source = $('                                    \n\
                                ', source, '                                \n\
                                ', unpackAll(field), '                      \n\
                            ')
                        } else {
                            source = $('                                    \n\
                                ', source, '                                \n\
                                object.' +
                                    field.name + ' = ' +
                                    variable + '                            \n\
                            ')
                        }
                    } else if (field.arrayed) {
                        if (field.bytes == 1) {
                        } else {
                            assignment = $('\n\
                                array[i] =                                  \n\
                                    ', read, '                              \n\
                                // __reference__                            \n\
                            ')
                        }
                        var stop = range.lengthEncoded ? 'value' : field.repeat
                        variables.push('array', 'i')
                        source = $('                                        \n\
                            ', source, '                                    \n\
                            object.' + field.name + ' = array = new Array(' + stop + ') \n\
                            for (i = 0; i < ' + stop + '; i++) {                        \n\
                                ', assignment, '                            \n\
                            }                                               \n\
                            object[' + str(field.name) + '] = array         \n\
                        ')
                    } else if (field.lengthEncoding) {
                        variables.push('value')
                        var assignment = $('                                \n\
                            value =                                         \n\
                                ', read, '')
                        source = $('                                        \n\
                            ', source, '                                    \n\
                            ', assignment, '                                \n\
                            object.' + range.name + ' = array = new Array(value) \n\
                        ')
                    } else {
                        var assignment = $('                                \n\
                            object.' + field.name + ' =                     \n\
                                ', read, '')
                        source = $('                                        \n\
                            ', source, '                                    \n\
                            ', assignment, '                                \n\
                        ')
                    }
                }
            }
        })
    })

    var vars = variables.map(function (variable) {
        return 'var ' + variable
    }).join('\n')

    source = $('                                                            \n\
        ', vars, '                                                          \n\
        // __blank__                                                        \n\
        ', source, '                                                        \n\
        // __blank__                                                        \n\
        if (next = callback(object)) {                                      \n\
            this.parse = next                                               \n\
            return this.parse(buffer, start, end)                           \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        return start                                                        \n\
    ')
    source = $('                                                            \n\
            ', composeIncrementalParser(ranges), '                          \n\
            // __blank__                                                    \n\
            return function (buffer, start, end) {                          \n\
                ', source, '                                                \n\
        }')

    return source
}

module.exports = composeParser
