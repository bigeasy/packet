var $ = require('programmatic')
var composeIncrementalSerializer = require('./inc')
var packForSerialization = require('./pack')

function composeSerializer (ranges) {
    var variables = [ 'next' ]
    var source = ''
    var step = 0

    ranges.forEach(function (range, rangeIndex) {
        var offset = 0

        if (range.fixed) {
            source = $('                                                    \n\
                ', source, '                                                \n\
                if (end - start < ' + range.size + ') {                     \n\
                    return inc.call(this, buffer, start, end, ' + step + ') \n\
                }                                                           \n\
                // __blank__                                                \n\
            ')
        } else if (range.lengthEncoded) {
            source = $('                                                    \n\
                ', source, '                                                \n\
                if (end - start < value) {                                  \n\
                    return inc.call(this, buffer, start, end, ' + step + ') \n\
                }                                                           \n\
                // __blank__                                                \n\
            ')
        }

        range.pattern.forEach(function (field, index) {
            step += 2
            if (field.endianness == 'x' && field.padding == null) {
                var skip = field.bytes * field.repeat
                offset += skip
                source = $('                                                \n\
                    ', source, '                                            \n\
                    start += ' + skip + '                                   \n\
                ')
            } else if (field.type == 'f') {
                var name = 'value'
                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bite = little ? 0 : bytes - 1
                var direction = little ? 1 : -1
                var stop = little ? bytes : -1
                var index = little ? 0 : bytes - 1

                variables.push(name)

                var copy = []
                while (bite != stop) {
                    copy.push('buffer[start++] = ' + name + '[' + index + ']')
                    offset++
                    bite += direction
                    index += direction
                }
                copy = copy.join('\n')

                source = $('                                                \n\
                    ', source, '                                            \n\
                    ' + name + ' = new ArrayBuffer(' + field.bytes + ')     \n\
                    new DataView(' +
                            name +
                        ').setFloat' + field.bits + '(0, object.' +
                            field.name + ', true)                           \n\
                    ', copy, '                                              \n\
                ')
            } else {
                if (field.bytes == 1 && field.padding == null && !field.packing) {
                    source = $('                                            \n\
                        ', source, '                                        \n\
                        buffer[start++] = object.' + field.name + '         \n\
                    ')
                    offset++
                } else {
                    var little = field.endianness == 'l'
                    var bytes = field.bytes
                    var bite = little ? 0 : bytes - 1
                    var direction = little ? 1 : -1
                    var stop = little ? bytes : -1
                    var assign, array = '', variable

                    if (field.packing) {
                        variable = packForSerialization(variables, field)
                    } else if (field.lengthEncoding) {
                        hoist('length')
                        variable = 'length = object[' + str(range.name) + '].length'
                    } else if (field.padding == null) {
                        variables.push('value')
                        if (field.arrayed) {
                            variables.push('array', 'i', 'I')
                            array = 'array = object[' + str(field.name) + ']'
                            variable = 'value = array[i]'
                        } else {
                            variable = 'value = object.' + field.name
                        }
                    } else {
                        assignment('\n\
                            value = 0x$padding                              \n\
                        ')
                        assignment.$padding(field.padding.toString(16))
                    }
                    var bites = []
                    while (bite != stop) {
                        var value = bite ? 'value >>> ' + bite * 8 : 'value'
                        bites.push('buffer[start++] = ' + value + ' & 0xff')
                        offset++
                        bite += direction
                    }
                    bites = bites.join('\n')

                    if (field.arrayed) {
                        var repeat = range.lengthEncoded ? 'length' : field.repeat
                        source = $('                                        \n\
                            ', source, '                                    \n\
                            ', array, '                                     \n\
                            for (i = 0; i < ' + repeat + '; i++) {          \n\
                                ', variable, '                              \n\
                                ', bites, '                                 \n\
                            }                                               \n\
                            // __blank__                                    \n\
                            ')
                    } else {
                        source = $('                                        \n\
                            ', source, '                                    \n\
                            ', variable, '                                  \n\
                            ', bites, '                                     \n\
                            // __blank__                                    \n\
                            ')
                    }
                }
            }
        })

        if (range.fixed) source = $('                                       \n\
            ', source, '                                                    \n\
        ')
    })

    var vars = variables.map(function (variable) {
        return 'var ' + variable
    }).join('\n')

    source = $('                                                            \n\
        ', composeIncrementalSerializer(ranges), '                          \n\
        // __blank__                                                        \n\
        return function (buffer, start, end) {                              \n\
            ', vars, '                                                      \n\
            // __blank__                                                    \n\
            ', source, '                                                    \n\
            if (next = callback && callback(object)) {                      \n\
                this.write = next                                           \n\
                return this.write(buffer, start, end)                       \n\
            }                                                               \n\
            // __blank__                                                    \n\
            return start                                                    \n\
        }                                                                   \n\
    ')

    return source

    function hoist (name) {
        if (variables.indexOf(name) == -1) {
            variables.push(name)
        }
    }
}

module.exports = composeSerializer
