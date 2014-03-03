var __slice = [].slice
var s = require('programmatic')

function line () {
    return __slice.call(arguments).join('')
}

function str (value) {
    return JSON.stringify(value)
}

function composeIncrementalParser (ranges) {
    var variables = []

    function constructor () {
        var source, previous = ''
        ranges.forEach(function (range, rangeIndex) {
            range.pattern.forEach(function (field, fieldIndex) {
                var index = (rangeIndex + fieldIndex) * 2

                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bite = little ? 0 : bytes - 1
                var direction = little ? 'bite++' : 'bite--'
                var stop = little ? bytes : -1

                var fieldName = '_' + field.name
                var parseIndex = index + 1

                variables.push('bite', 'next', fieldName)

                source = s('\
                    case ' + index + ':                                     \n\
                        ' + fieldName + ' = 0                               \n\
                        bite = ' + bite + '                                 \n\
                        index = ' + parseIndex + '                          \n\
                    case ' + parseIndex + ':                                \n\
                        while (bite != ' + stop + ') {                      \n\
                            if (start == end) {                             \n\
                                return start                                \n\
                            }                                               \n\
                            ', fieldName,
                            ' += Math.pow(256, bite) * buffer[start++]      \n\
                            ' + direction + '                               \n\
                        }                                                   \n\
                ')

                // sign fixup
                source = s('\
                    // __reference__ \n\
                    ', previous , '\n\
                    ', source, '                                              \n\
                        object[' + str(field.name) + '] = ' + fieldName )
            })
        })

        source = s('\n\
        this.parse = function (buffer, start, end) {           \n\
            switch (index) { \n\
            ', source, '                                       \n\
            }                                                               \n\
            // __blank__                                                        \n\
            if (next = callback(object)) {                                  \n\
                this.parse = next                                           \n\
                return this.parse(buffer, start, end)                       \n\
            }                                                               \n\
            // __blank__                                                        \n\
            return start                                                    \n\
        }                                                                  \n\
        // __blank__                                                           \n\
        return this.parse(buffer, start, end)                              \n\
        ')

        return source
    }

    var source = constructor()

    var vars = variables.map(function (variable) {
        return 'var ' + variable + '\n'
    })

    return s('\n\
        var inc\n\
        // __blank__\n\
        inc = function (buffer, start, end, index) {\n\
            ', s.apply(null, vars), '\n\
            // __blank__\n\
            ', source, '\n\
        }\n\
        ')
}

function fixupSignage (fieldName, operation) {
    var mask = '0xff' + new Array(field.bytes).join('ff')
    var sign = '0x80' + new Array(field.bytes).join('00')
    return [
        fieldName, ' = ', fieldName, ' & ', sign, ' ? (', mask, ' - ', fieldName,
            ' + 1) * -1 : , fieldName' ]
}

exports.composeParser = function (ranges) {
    composeIncrementalParser(ranges)

        var tmp

    ranges.forEach(function (range) {
        tmp = s('\n\
            if (end - start < ' + range.size + ') {                         \n\
                return inc.call(this, buffer, start, end, ' + range.patternIndex + ')    \n\
            }                                                               \n\
            // __blank__                                                        \n\
        ')

        var offset = 0
        range.pattern.forEach(function (field, index) {
            if (field.endianness == 'x') {
                offset += field.bytes * field.repeat
            } else if (field.type == 'f') {
                var operation = source()

                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bite = little ? 0 : bytes - 1
                var direction = little ? 1 : -1
                var stop = little ? bytes : -1

                hoist('_' + field.name)

                operation('\n\
                    _$field = new ArrayBuffer($size)                        \n\
                    $copy                                                   \n\
                    object[$name] = $extract                                \n\
                ')
                var copy = source()
                while (bite != stop) {
                    var assignment = source()
                    assignment('_$field[$index] = buffer[$inc]')
                    assignment.$field(field.name)
                    assignment.$inc(offset == 0 ? 'start' : 'start + $offset')
                    assignment.$index(bite)
                    assignment.$offset && assignment.$offset(offset)
                    offset++
                    //previous.$next(String(read))
                    copy(assignment)
                    bite += direction
                }
                operation.$copy(copy)
                operation.$extract('new DataView(_$field).getFloat$bits(0, true)')
                operation.$name(JSON.stringify(field.name))
                operation.$bits(field.bits)
                operation.$field(field.name)
                operation.$size(field.bytes)

                section(operation)
            } else {
                if (field.bytes == 1 && ! field.signed) {
                    assignment('\n\
                        $variable = buffer[$inc]                            \n\
                    ')
                    assignment.$inc(offset ? 'start + $offset' : 'start')
                    assignment.$offset && assignment.$offset(offset)
                    assignment.$variable('object[$name]')
                    offset++
                } else {
                    var little = field.endianness == 'l'
                    var bytes = field.bytes
                    var bite = little ? 0 : bytes - 1
                    var direction = little ? 1 : -1
                    var stop = little ? bytes : -1

                    var piece = ''
                    var read = [], inc = ''
                    while (bite != stop) {
                        inc = offset == 0 ? 'start' : 'start + ' + offset
                        read.unshift('buffer[' + inc + ']')
                        if (bite) {
                            read[0] += ' * 0x' + Math.pow(256, bite).toString(16)
                        }
                        offset++
                        bite += direction
                    }
                    read = read.reverse().join(' + \n    ')
                    var variable
                    if (field.signed) {
                        var fieldName = '_' + field.name
                        var variable = fieldName

                        assignment.$variable('_$field')
                        assignment.$field(field.name)
                        hoist('_' + field.name)
                        fixupSignage(field, assignment)
                        assignment('\
                            object[$name] = _$field \n\
                        ')
                    } else {
                        var assignment = s('object[' + str(field.name) + '] = \n    ' + read)
                        tmp = s('\n\
                            ', tmp, '\n\
                            ', assignment, '\n\
                        ')
                        var variable = 'object[' + str(field.name) + ']'
                    }
                }
            }
        })

        if (range.fixed) tmp = s('\n\
            ', tmp, '\n\
            // __blank__                                                         \n\
            start += ' + range.size + '                                     \n\
        ')
    })

    if (false) {
    var parser = source()
    if (hoist()) {
        parser('\n\
            $variables                                                      \n\
            $sections                                                       \n\
                                                                            \n\
            if (next = callback(object)) {                                  \n\
                this.parse = next                                           \n\
                return this.parse(buffer, start, end)                       \n\
            }                                                               \n\
                                                                            \n\
            return start                                                    \n\
        ')
        parser.$variables(hoist())
    } else {
        parser('\n\
            $sections                                                       \n\
                                                                            \n\
            if (next = callback(object)) {                                  \n\
                this.parse = next                                           \n\
                return this.parse(buffer, start, end)                       \n\
            }                                                               \n\
                                                                            \n\
            return start                                                    \n\
        ')
    }
    parser.$sections(sections)
    }

    tmp = s('\
        var next\n\
        // __blank__\n\
        ', tmp, '\n\
        // __blank__                                                            \n\
        if (next = callback(object)) {                                      \n\
            this.parse = next                                               \n\
            return this.parse(buffer, start, end)                           \n\
        }                                                                   \n\
        // __blank__                                                            \n\
        return start                                                        \n\
    ')
    tmp = s('\
            ', composeIncrementalParser(ranges), '                          \n\
            // __blank__                                                        \n\
            return function (buffer, start, end) {                          \n\
                ', tmp, '                                     \n\
        }')
    return tmp
}

function composeIncrementalSerializer (ranges) {
    var outer = [ 'var .index;', 'var .bite;' ]
    var tmp, previous = ''
    var variables = [ 'index', 'bite', 'next' ]
    outer.push('var .next;')

    ranges.forEach(function (range, rangeIndex) {
        var offset = 0

        range.pattern.forEach(function (field, patternIndex) {
            if (field.endianness == 'x' && field.padding == null) {
                var section = source()
                var index = (rangeIndex + patternIndex) * 2
                section('\
                    case $initiationIndex:                                  \n\
                        skip = start + $skip                                \n\
                        index = $parseIndex                                 \n\
                    case $parseIndex:                                       \n\
                        if (end < skip) {                                   \n\
                            return end                                      \n\
                        }                                                   \n\
                        start = skip                                        \
                ')
                hoist('skip')
                section.$initiationIndex(index)
                section.$skip(field.bytes * field.repeat)
                section.$parseIndex(index + 1)
                cases(section)
            } else if (field.type == 'f') {
                var section = source()

                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bite = little ? 0 : bytes - 1
                var direction = little ? 1 : -1
                var stop = little ? bytes : -1
                var index = (rangeIndex + patternIndex) * 2

                hoist('_' + field.name)

                section('\
                    case $initiationIndex:                                  \n\
                        $initialization                                     \n\
                        index = $patternIndex                               \n\
                    case $patternIndex:                                     \n\
                        $serialize                                          \
                ')
                section.$initiationIndex(index)

                section.$initialization('\n\
                    _$field = new ArrayBuffer($size)                        \n\
                    new DataView(_$field).setFloat$bits(0, object[$name], true)\n\
                    bite = $start                                           \n\
                ')
                section.$start(bite)
                section.$size(field.bytes)
                section.$field(field.name)
                section.$patternIndex(index + 1)

                var operation = source()

                operation('\n\
                    while (bite != $stop) {                                 \n\
                        if (start == end) {                                 \n\
                            return start                                    \n\
                        }                                                   \n\
                        buffer[start++] = _$field[$direction]               \n\
                    }')

                operation.$field(field.name)
                operation.$stop(stop)
                operation.$direction(direction < 0 ? 'bite--' : 'bite++')

                section.$serialize(operation)
                section.$name(JSON.stringify(field.name))
                section.$bits(field.bits)
                cases(section)
            } else {
                var index = (rangeIndex + patternIndex) * 2
                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bite = little ? 0 : bytes - 1
                var direction = little ? 'bite++' : 'bite--'
                var stop = little ? bytes : -1
                var init
                var variable = '_' + field.name

                if (field.packing) {
                    variable = 'value'
                    section.$initialization(packForSerialization(hoist, field))
                } else if (field.padding == null) {
                    variables.push(variable)
                    init = line(variable, ' = ', 'object[' + str(field.name) + ']')
                } else {
                    section.$initialization('\n\
                            $variable = 0x$padding                          \n\
                    ')
                    section.$padding(field.padding.toString(16))
                    var variable = 'value'
                }

                tmp = s('\
                    ', previous, '                                          \n\
                    case ' + index + ':                                     \n\
                        ' + init + '                                        \n\
                        bite = ' + bite + '                                 \n\
                        index = ' + (index + 1) + '                         \n\
                    case ' + (index + 1) + ':                               \n\
                        while (bite != ' + stop + ') {                           \n\
                           if (start == end) {                                  \n\
                               return start                                     \n\
                           }                                                    \n\
                           buffer[start++] = ' + variable + ' >>> bite * 8 & 0xff      \n\
                           ' + direction + '                                    \n\
                        }                                                       \
                ')
            }
        })
    })

    tmp = s('\
            switch (index) {                                                    \n\
            ', tmp, '                                                           \n\
            }                                                                   \n\
            // __blank__                                                            \n\
            if (next = callback && callback(object)) {                          \n\
                this.write = next                                               \n\
                return this.write(buffer, start, end)                           \n\
            }                                                                   \n\
            // __blank__                                                            \n\
            return start                                                        \n\
    ')

    outer.push('var .index;')
    outer.push('var .bite;')

    // TODO: Add a `var next` here.
    tmp = s('\n\
        this.write = function (buffer, start, end) {                        \n\
            ', tmp, '                                                     \n\
        }                                                                   \n\
        // __blank__                                                            \n\
        return this.write(buffer, start, end)                               \n\
    ')

    var vars = variables.map(function (variable) {
        return 'var ' + variable
    }).join('\n')

    tmp = s('                                                               \n\
        var inc                                                             \n\
        // __blank__                                                            \n\
        inc = function (buffer, start, end, index) {                              \n\
            ', vars, '                                                      \n\
            // __blank__                                                        \n\
            ', tmp, '                                                       \n\
        }                                                                   \n\
    ')

    return tmp
}

exports.composeSerializer = function (ranges) {
    var variables = [ 'next' ]
    var tmp

    ranges.forEach(function (range) {
        var offset = 0

        tmp = s('\n\
            if (end - start < ' + range.size + ') {                                      \n\
                return inc.call(this, buffer, start, end, ' + range.patternIndex + ')    \n\
            }                                                               \n\
            // __blank__                                                        \n\
        ')

        range.pattern.forEach(function (field, index) {
            if (field.endianness == 'x' && field.padding == null) {
                offset += field.bytes * field.repeat
            } else if (field.type == 'f') {
                var operation = source()

                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bite = little ? 0 : bytes - 1
                var direction = little ? 1 : -1
                var stop = little ? bytes : -1

                hoist('_' + field.name)

                operation('\n\
                    _$field = new ArrayBuffer($size)                        \n\
                    new DataView(_$field).setFloat$bits(0, object[$name], true)\n\
                    $copy                                                   \n\
                ')
                var copy = source()
                while (bite != stop) {
                    var assignment = source()
                    assignment('buffer[$inc] = _$field[$index]')
                    assignment.$field(field.name)
                    assignment.$inc(offset == 0 ? 'start' : 'start + $offset')
                    assignment.$index(bite)
                    assignment.$offset && assignment.$offset(offset)
                    offset++
                    //previous.$next(String(read))
                    copy(assignment)
                    bite += direction
                }
                operation.$copy(copy)
                operation.$name(JSON.stringify(field.name))
                operation.$bits(field.bits)
                operation.$field(field.name)
                operation.$size(field.bytes)

                section(operation)
            } else {
                if (field.bytes == 1 && field.padding == null && !field.packing) {
                    assignment('\n\
                        buffer[$inc] = $fiddle                              \n\
                    ')
                    assignment.$inc(offset ? 'start + $offset' : 'start')
                    assignment.$offset && assignment.$offset(offset)
                    assignment.$fiddle(function () { object[$name] })
                    assignment.$name(JSON.stringify(field.name))
                    offset++
                } else {
                    var little = field.endianness == 'l'
                    var bytes = field.bytes
                    var bite = little ? 0 : bytes - 1
                    var direction = little ? 1 : -1
                    var stop = little ? bytes : -1
                    var assign

                    if (field.packing) {
                        assignment = packForSerialization(hoist, field)
                    } else if (field.padding == null) {
                        variables.push('value')
                        var variable = 'value = object[' + str(field.name) + ']'
                    } else {
                        assignment('\n\
                            value = 0x$padding                              \n\
                        ')
                        assignment.$padding(field.padding.toString(16))
                    }
                    var bites = []
                    while (bite != stop) {
                        var inc = offset ? 'start + ' + offset : 'start'
                        var value = bite ? 'value >>> ' + bite * 8 : 'value'
                        bites.push('buffer[' + inc + '] = ' + value + ' & 0xff')
                        offset++
                        bite += direction
                    }
                    bites = bites.join('\n')

                    tmp = s('                                         \n\
                        ', tmp, '                                           \n\
                        ', variable, '                                      \n\
                        ', bites, '\n\
                        // __blank__                                            \n\
                        ')
                }
            }
        })

        if (range.fixed) tmp = s('                                          \n\
            ', tmp, '                                                       \n\
            start += ' + range.size + '                                     \n\
            // __blank__                                                        \n\
        ')
    })

    var vars = variables.map(function (variable) {
        return 'var ' + variable
    }).join('\n')

    tmp = s('                                                               \n\
        ', composeIncrementalSerializer(ranges), '                          \n\
        // __blank__                                                            \n\
        return function (buffer, start, end) {                              \n\
            ', vars, '                                                      \n\
            // __blank__                                                        \n\
            ', tmp, '                                                       \n\
            if (next = callback && callback(object)) {                      \n\
                this.write = next                                           \n\
                return this.write(buffer, start, end)                       \n\
            }                                                               \n\
            // __blank__                                                        \n\
            return start                                                    \n\
        }                                                                   \n\
    ')

    return tmp
}

exports.composeSizeOf = function (ranges) {
    var fixed = 0

    ranges.forEach(function (range) {
        if (range.fixed) {
            range.pattern.forEach(function (field) {
                fixed += field.bytes * field.repeat
            })
        }
    })

    return 'return ' + fixed
}
