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
                var fixup = '', assign

                var initialization, fixup
                if (field.type == 'f') {
                    initialization = s('                                    \n\
                        ' + fieldName +
                            ' = new ArrayBuffer(' + field.bytes + ')        \n\
                    ')
                    fixup = s('                                             \n\
                        ' + fieldName + ' = new DataView(' +
                            fieldName + ').getFloat' +
                                field.bits + '(0, true)                     \n\
                    ')
                    assign = '[bite] = buffer[start++]'
                } else {
                    initialization = s('                                    \n\
                        ' + fieldName + ' = 0                               \n\
                    ')
                    fixup = signage(field)
                    assign = ' += Math.pow(256, bite) * buffer[start++]'
                }

                variables.push('bite', 'next', fieldName)

                source = s('                                                \n\
                    case ' + index + ':                                     \n\
                        ', initialization, '                                \n\
                        bite = ' + bite + '                                 \n\
                        index = ' + parseIndex + '                          \n\
                    case ' + parseIndex + ':                                \n\
                        while (bite != ' + stop + ') {                      \n\
                            if (start == end) {                             \n\
                                return start                                \n\
                            }                                               \n\
                            ' + fieldName + assign + '                      \n\
                            ' + direction + '                               \n\
                        }                                                   \n\
                ')

                // sign fixup
                source = s('                                                \n\
                    // __reference__                                        \n\
                    ', previous , '                                         \n\
                    ', source, '                                            \n\
                        ', fixup, '                                         \n\
                        object[' + str(field.name) + '] = ' + fieldName)
            })
        })

        source = s('                                                        \n\
        this.parse = function (buffer, start, end) {                        \n\
            switch (index) {                                                \n\
            ', source, '                                                    \n\
            }                                                               \n\
            // __blank__                                                    \n\
            if (next = callback(object)) {                                  \n\
                this.parse = next                                           \n\
                return this.parse(buffer, start, end)                       \n\
            }                                                               \n\
            // __blank__                                                    \n\
            return start                                                    \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        return this.parse(buffer, start, end)                               \n\
        ')

        return source
    }

    var source = constructor()

    var vars = variables.map(function (variable) {
        return 'var ' + variable + '\n'
    })

    return s('                                                              \n\
        var inc                                                             \n\
        // __blank__                                                        \n\
        inc = function (buffer, start, end, index) {                        \n\
            ', s.apply(null, vars), '                                       \n\
            // __blank__                                                    \n\
            ', source, '                                                    \n\
        }                                                                   \n\
        ')
}

function signage (signed, name, bits, width) {
    var vargs = __slice.call(arguments),
        mask = 0xffffffff, test = 1
    if (vargs.length == 1) {
        signed = vargs[0].signed
        name = '_' + vargs[0].name
        bits = vargs[0].bytes * 8
        width = vargs[0].bytes * 8
    }
    if (!signed) return ''
    mask = mask >>> (32 - bits)
    test = test << (width - 1) >>> 0
    return name + ' = ' + name + ' & 0x' + test.toString(16) +
        ' ? (0x' + mask.toString(16) + ' - ' + name + ' + 1) * -1 : ' + name
}

exports.composeParser = function (ranges) {
    composeIncrementalParser(ranges)

    var tmp, variables = [ 'next' ]

    ranges.forEach(function (range) {
        tmp = s('                                                           \n\
            if (end - start < ' + range.size + ') {                         \n\
                return inc.call(this, buffer, start, end, ' +
                    range.patternIndex + ')                                 \n\
            }                                                               \n\
            // __blank__                                                    \n\
        ')

        var offset = 0
        range.pattern.forEach(function (field, index) {
            if (field.endianness == 'x') {
                offset += field.bytes * field.repeat
            } else if (field.type == 'f') {
                var name = '_' + field.name
                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bite = little ? 0 : bytes - 1
                var direction = little ? 1 : -1
                var stop = little ? bytes : -1
                var index = little ? 0 : bytes - 1

                variables.push(name)

                var copy = [], inc
                while (bite != stop) {
                    copy.push(
                        name +
                        '[' +
                            index +
                        '] = buffer[' +
                            (offset == 0 ? 'start' : 'start + ' + offset) +
                        ']')
                    offset++
                    index += direction
                    bite += direction
                }
                copy = copy.join('\n')

                tmp = s('                                                   \n\
                    ', tmp, '                                               \n\
                    ' + name + ' = new ArrayBuffer(' + field.bytes + ')     \n\
                    ', copy, '                                              \n\
                    object[' +
                            str(field.name) +
                        '] = new DataView(' +
                            name +
                        ').getFloat' +
                            field.bits +
                        '(0, true)                                          \n\
                ')
            } else {
                if (field.bytes == 1 && ! field.signed) {
                    tmp = s('                                               \n\
                        ', tmp, '                                           \n\
                        object[' +
                            str(field.name) +
                            '] = buffer[' +
                            (offset ? 'start + ' + offset : 'start') +
                            ']                                              \n\
                    ')
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
                    if (field.signed) {
                        var fieldName = '_' + field.name
                        variables.push(fieldName)
                        if (field.bytes == 1) {
                            var assignment = s(fieldName + ' = ' + read)
                        } else {
                            var assignment = s(fieldName + ' = \n    ' + read)
                        }
                        tmp = s('                                           \n\
                            ', tmp, '                                       \n\
                            ', assignment, '                                \n\
                            ', signage(field), '                            \n\
                            object[' + str(field.name) +
                                '] = ' + fieldName + '                      \n\
                        ')
                    } else {
                        // todo: tidy
                        var assignment = s('object[' + str(field.name) + '] = \n    ' + read)
                        tmp = s('                                           \n\
                            ', tmp, '                                       \n\
                            ', assignment, '                                \n\
                        ')
                    }
                }
            }
        })

        if (range.fixed) tmp = s('                                          \n\
            ', tmp, '                                                       \n\
            // __blank__                                                    \n\
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

    var vars = variables.map(function (variable) {
        return 'var ' + variable
    }).join('\n')

    tmp = s('                                                               \n\
        ', vars, '                                                          \n\
        // __blank__                                                        \n\
        ', tmp, '                                                           \n\
        // __blank__                                                        \n\
        if (next = callback(object)) {                                      \n\
            this.parse = next                                               \n\
            return this.parse(buffer, start, end)                           \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        return start                                                        \n\
    ')
    tmp = s('                                                               \n\
            ', composeIncrementalParser(ranges), '                          \n\
            // __blank__                                                    \n\
            return function (buffer, start, end) {                          \n\
                ', tmp, '                                                   \n\
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
            } else if (false && field.type == 'f') {
                var name = '_' + field.name
                var key = str(field.name)
                var little = field.endianness == 'l'
                var bits = field.bits
                var bytes = field.bytes
                var bite = little ? 0 : bytes - 1
                var direction = little ? 1 : -1
                var stop = little ? bytes : -1
                var index = (rangeIndex + patternIndex) * 2

                variables.push(name)

                tmp = s('\
                    ', previous, '                                          \n\
                    case ' + index + ':                                     \n\
                        ', init, '                                          \n\
                        index = ' + (index + 1) + '                         \n\
                    case ' + (index + 1) + ':                               \n\
                        $serialize                                          \
                ')
                section.$initiationIndex(index)

                section.$initialization
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
                var name = '_' + field.name
                var key = str(field.name)
                var index = (rangeIndex + patternIndex) * 2
                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bits = field.bits
                var bite = little ? 0 : bytes - 1
                var direction = little ? 'bite++' : 'bite--'
                var stop = little ? bytes : -1
                var init, assign

                if (field.type == 'f') {
                    init = s('\n\
                        ' + name + ' = new ArrayBuffer(' + bytes + ')       \n\
                        new DataView(' + name + ').setFloat' + bits +
                            '(0, object[' + key + '], true)                 \n\
                    ')
                    assign = name + '[bite]'
                    variables.push(name)
                } else if (field.packing) {
                    name = 'value'
                    section.$initialization(packForSerialization(hoist, field))
                } else if (field.padding == null) {
                    variables.push(name)
                    init = line(name, ' = ', 'object[' + str(field.name) + ']')
                    assign = name + ' >>> bite * 8 & 0xff'
                } else {
                    section.$initialization('                               \n\
                            $variable = 0x$padding                          \n\
                    ')
                    section.$padding(field.padding.toString(16))
                    var variable = 'value'
                }

                // todo: bad indent on while loop below.
                tmp = s('\
                    ', previous, '                                          \n\
                    case ' + index + ':                                     \n\
                        ', init, '                                          \n\
                        bite = ' + bite + '                                 \n\
                        index = ' + (index + 1) + '                         \n\
                    case ' + (index + 1) + ':                               \n\
                        while (bite != ' + stop + ') {                      \n\
                           if (start == end) {                              \n\
                               return start                                 \n\
                           }                                                \n\
                           buffer[start++] = ' + assign + '                 \n\
                           ' + direction + '                                \n\
                        }                                                   \
                ')
            }
        })
    })

    tmp = s('\
            switch (index) {                                                \n\
            ', tmp, '                                                       \n\
            }                                                               \n\
            // __blank__                                                    \n\
            if (next = callback && callback(object)) {                      \n\
                this.write = next                                           \n\
                return this.write(buffer, start, end)                       \n\
            }                                                               \n\
            // __blank__                                                    \n\
            return start                                                    \n\
    ')

    outer.push('var .index;')
    outer.push('var .bite;')

    // TODO: Add a `var next` here.
    tmp = s('                                                               \n\
        this.write = function (buffer, start, end) {                        \n\
            ', tmp, '                                                       \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        return this.write(buffer, start, end)                               \n\
    ')

    var vars = variables.map(function (variable) {
        return 'var ' + variable
    }).join('\n')

    tmp = s('                                                               \n\
        var inc                                                             \n\
        // __blank__                                                        \n\
        inc = function (buffer, start, end, index) {                        \n\
            ', vars, '                                                      \n\
            // __blank__                                                    \n\
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
            if (end - start < ' + range.size + ') {                         \n\
                return inc.call(this, buffer, start, end, ' + range.patternIndex + ')    \n\
            }                                                               \n\
            // __blank__                                                    \n\
        ')

        range.pattern.forEach(function (field, index) {
            if (field.endianness == 'x' && field.padding == null) {
                offset += field.bytes * field.repeat
            } else if (field.type == 'f') {
                var name = '_' + field.name
                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bite = little ? 0 : bytes - 1
                var direction = little ? 1 : -1
                var stop = little ? bytes : -1
                var index = little ? 0 : bytes - 1

                variables.push(name)

                var copy = []
                while (bite != stop) {
                    copy.push('buffer[' +
                            (offset == 0 ? 'start' : 'start + ' + offset) +
                        '] = ' + name + '[' + index + ']')
                    offset++
                    bite += direction
                    index += direction
                }
                copy = copy.join('\n')

                tmp = s('                                                   \n\
                    ', tmp, '                                               \n\
                    ' + name + ' = new ArrayBuffer(' + field.bytes + ')     \n\
                    new DataView(' +
                            name +
                        ').setFloat' + field.bits + '(0, object[' +
                            str(field.name) + '], true)                     \n\
                    ', copy, '                                              \n\
                ')
            } else {
                if (field.bytes == 1 && field.padding == null && !field.packing) {
                    tmp = s('                                               \n\
                        ', tmp, '\n\
                        buffer[' + (offset ? 'start + ' + offset : 'start') +
                            '] = object[' + str(field.name) + ']            \n\
                    ')
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

                    tmp = s('                                               \n\
                        ', tmp, '                                           \n\
                        ', variable, '                                      \n\
                        ', bites, '                                         \n\
                        // __blank__                                        \n\
                        ')
                }
            }
        })

        if (range.fixed) tmp = s('                                          \n\
            ', tmp, '                                                       \n\
            start += ' + range.size + '                                     \n\
            // __blank__                                                    \n\
        ')
    })

    var vars = variables.map(function (variable) {
        return 'var ' + variable
    }).join('\n')

    tmp = s('                                                               \n\
        ', composeIncrementalSerializer(ranges), '                          \n\
        // __blank__                                                        \n\
        return function (buffer, start, end) {                              \n\
            ', vars, '                                                      \n\
            // __blank__                                                    \n\
            ', tmp, '                                                       \n\
            if (next = callback && callback(object)) {                      \n\
                this.write = next                                           \n\
                return this.write(buffer, start, end)                       \n\
            }                                                               \n\
            // __blank__                                                    \n\
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
