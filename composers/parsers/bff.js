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
    },
    assignment: function (source, vars) {
        var field = vars.field
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
            var assignment = vars.assignee + ' = ' + read
        } else {
            var assignment = $('\n\
                ' + vars.assignee + ' =                                     \n\
                    ', read, '')
        }
        return $('                                                          \n\
            ', source, '                                                    \n\
            ', assignment, '                                                \n\
        ')
    },
    signage: function (source, vars) {
        return $('                                                          \n\
            ', source, '                                                    \n\
            ', signage(vars.field, 'object.' + vars.field.name), '          \n\
        ')
    },
    unpack: function (source, vars) {
        return $('                                                          \n\
            ', source, '                                                    \n\
            ', unpackAll(vars.field), '                                     \n\
        ')
    }
}

function composeParser (ranges) {
    composeIncrementalParser(ranges)

    var source = '', variables = [ 'next' ], step = 0

    var operations = []

    ranges.forEach(function (range, rangeIndex) {
        if (rangeIndex) {
            operations.push({ formatter: 'blank' })
        }

        operations.push({
            formatter: 'range',
            sentry: range.fixed ? range.size : 'value',
            step: step
        })

        var offset = 0
        range.pattern.forEach(function (field, index) {
            step += 2
            if (field.endianness == 'x') {
                operations.push({ formatter: 'skip', field: field })
            } else {
                var name = 'value'

                if (field.type == 'f') {
                    variables.push('value')
                    operations.push({ formatter: 'arrayBuffer', field: field })
                    operations.push({ formatter: 'copy', field: field })
                    operations.push({ formatter: 'toFloat', field: field })
                } else {
                    if (field.packing || field.signed || field.lengthEncoding) {
                        variables.push('value')
                        var assignee = 'value'
                    } else {
                        var assignee = 'object.' + field.name
                    }
                    operations.push({
                        formatter: 'assignment',
                        field: field,
                        assignee: assignee
                    })
                    if (field.packing) {
                        operations.push({ formatter: 'unpack', field: field })
                    } else if (field.signed) {
                        operations.push({ formatter: 'signage', field: field })
                    }
                }
            }
        })
    })

    var source = ''
    operations.forEach(function (operation) {
        source = formatters[operation.formatter](source, operation)
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
