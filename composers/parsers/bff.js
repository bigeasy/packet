var $ = require('programmatic')
var signage = require('./signage')
var composeIncrementalParser = require('./inc')
var unpackAll = require('./unpack')

function assignment (field) {
    var little = field.endianness == 'l'
    var bytes = field.bytes
    var bite = little ? 0 : bytes - 1
    var direction = little ? 1 : -1
    var stop = little ? bytes : -1
    var read = []
    while (bite != stop) {
        read.unshift('buffer[start++]')
        if (bite) {
            read[0] += ' * 0x' + Math.pow(256, bite).toString(16)
        }
        bite += direction
    }
    read = read.reverse().join(' + \n')
    if (field.bytes == 1) {
        return field.assignee + ' = ' + read
    } else {
        return $('\n\
            ' + field.assignee + ' =                              \n\
                ', read, '')
    }
}


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
    },
    arrayBuffer: function (source, vars) {
        return $('                                                          \n\
            ', source, '                                                    \n\
            value = new ArrayBuffer(' + vars.field.bytes + ')               \n\
        ')
    },
    copy: function (source, vars) {
        var field = vars.field
        var little = field.endianness == 'l'
        var bytes = field.bytes
        var bite = little ? 0 : bytes - 1
        var direction = little ? 1 : -1
        var stop = little ? bytes : -1
        var index = little ? 0 : bytes - 1
        var copy = []
        while (bite != stop) {
            copy.push('value[' + index + '] = buffer[start++]')
            index += direction
            bite += direction
        }
        return $('                                                          \n\
            ', source, '                                                    \n\
            ', copy.join('\n'), '                                           \n\
        ')
    },
    toFloat: function (source, vars) {
        var bits = vars.field.bits, name = vars.field.name
        return $('                                                          \n\
            ', source, '                                                    \n\
            object.' + name +
                ' = new DataView(value).getFloat' + bits + '(0, true)       \n\
        ')
    },
    skip: function (source, vars) {
        var skip = vars.field.bytes * vars.field.repeat
        return $('                                                          \n\
            ', source, '                                                    \n\
            start += ' + skip + '                                           \n\
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
                source = formatters.skip(source, { field: field })
            } else if (field.bytes == 1 && ! field.signed) {
                source = $('                                                \n\
                    ', source, '                                            \n\
                    object.' + field.name + ' = buffer[start++]             \n\
                ')
                offset++
            } else {
                var name = 'value'

                if (field.type == 'f') {
                    variables.push('value')
                    source = formatters.arrayBuffer(source, { field: field })
                    source = formatters.copy(source, { field: field })
                    source = formatters.toFloat(source, { field: field })
                } else {
                    if (field.packing || field.signed || field.lengthEncoding) {
                        variables.push('value')
                        field.assignee = 'value'
                    } else if (field.arrayed) {
                        field.assignee = 'array[i]'
                    } else {
                        field.assignee = 'object.' + field.name
                    }
                    if (field.packing || field.signed) {
                        var variable = 'value'
                        source = $('                                        \n\
                            ', source, '                                    \n\
                            ', assignment(field, variables), '              \n\
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
                    } else {
                        source = $('                                        \n\
                            ', source, '                                    \n\
                            ', assignment(field, variables), '              \n\
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
