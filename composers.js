var __slice = [].slice
var $ = require('programmatic')

function line () {
    return __slice.call(arguments).join('')
}

function str (value) {
    return JSON.stringify(value)
}

function composeIncrementalParser (ranges) {
    var variables = [], source, previous = ''

    ranges.forEach(function (range, rangeIndex) {
        range.pattern.forEach(function (field, fieldIndex) {
            var step = (rangeIndex + fieldIndex) * 2

            var little = field.endianness == 'l'
            var bytes = field.bytes
            var bite = little ? 0 : bytes - 1
            var direction = little ? 'bite++' : 'bite--'
            var stop = little ? bytes : -1

            var variable = field.packing ? 'value' : '_' + field.name
            var parseStep = step + 1
            var fixup = '', assign

            var initialization, fixup
            if (field.type == 'f') {
                initialization = $('                                        \n\
                    ' + variable +
                        ' = new ArrayBuffer(' + field.bytes + ')            \n\
                ')
                fixup = $('                                                 \n\
                    ' + variable + ' = new DataView(' +
                        variable + ').getFloat' +
                            field.bits + '(0, true)                         \n\
                ')
                assign = '[bite] = buffer[start++]'
            } else {
                initialization = $('                                        \n\
                    ' + variable + ' = 0                                    \n\
                ')
                fixup = signage(field)
                assign = ' += Math.pow(256, bite) * buffer[start++]'
            }

            variables.push('bite', 'next', variable)

            source = $('                                                    \n\
                case ' + step + ':                                          \n\
                    ', initialization, '                                    \n\
                    bite = ' + bite + '                                     \n\
                    step = ' + parseStep + '                                \n\
                case ' + parseStep + ':                                     \n\
                    while (bite != ' + stop + ') {                          \n\
                        if (start == end) {                                 \n\
                            return start                                    \n\
                        }                                                   \n\
                        ' + variable + assign + '                           \n\
                        ' + direction + '                                   \n\
                    }                                                       \n\
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
            } else {
                source = $('                                                \n\
                    // __reference__                                        \n\
                    ', source, '                                            \n\
                        object[' + str(field.name) + '] = ' + variable + '  \n\
                ')
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

    return $('                                                              \n\
        var inc                                                             \n\
        // __blank__                                                        \n\
        inc = function (buffer, start, end, step) {                         \n\
            ', $.apply(null, vars), '                                       \n\
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

function unpack (bits, offset, length) {
    var mask = 0xffffffff, shift
    mask = mask >>> (32 - bits)
    mask = mask >>> (bits - length)
    shift = bits - offset - length
    shift = shift ? 'value >>> ' + shift : 'value'
    return shift + ' & 0x' + mask.toString(16)
}

function unpackAll (field) {
    var source = ''
    var bits = field.bytes * 8
    var offset = 0
    var bit = 0
    var packing = field.packing.map(function (field) {
        field.offset = bit
        bit += field.bits
        return field
    })
    return packing.map(function (field) {
        return 'object[' +
                str(field.name) + '] = ' +
                unpack(bits, field.offset, field.bits)
    }).join('\n')
}

exports.composeParser = function (ranges) {
    composeIncrementalParser(ranges)

    var tmp, variables = [ 'next' ]

    ranges.forEach(function (range) {
        tmp = $('                                                           \n\
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
                        '] = buffer[start++]')
                    offset++
                    index += direction
                    bite += direction
                }
                copy = copy.join('\n')

                tmp = $('                                                   \n\
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
                    tmp = $('                                               \n\
                        ', tmp, '                                           \n\
                        object[' +
                            str(field.name) +
                            '] = buffer[start++]                            \n\
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
                        read.unshift('buffer[start++]')
                        if (bite) {
                            read[0] += ' * 0x' + Math.pow(256, bite).toString(16)
                        }
                        offset++
                        bite += direction
                    }
                    read = read.reverse().join(' + \n')
                    if (field.packing || field.signed) {
                        var variable = field.packing ? 'value' : '_' + field.name
                        variables.push(variable)
                        if (field.bytes == 1) {
                            var assignment = $(variable + ' = ' + read)
                        } else {
                            var assignment = $('\n\
                                ' + variable + ' =                          \n\
                                    ', read, '')
                        }
                        tmp = $('                                           \n\
                            ', tmp, '                                       \n\
                            ', assignment, '                                \n\
                            ', signage(field), '                            \n\
                        ')
                        if (field.packing) {
                            tmp = $('                                       \n\
                                ', tmp, '                                   \n\
                                ', unpackAll(field), '                      \n\
                            ')
                        } else {
                            tmp = $('                                       \n\
                                ', tmp, '                                   \n\
                                object[' +
                                    str(field.name) + '] = ' +
                                    variable + '                            \n\
                            ')
                        }
                    } else {
                        // todo: tidy
                        var assignment = $('object[' + str(field.name) + '] = \n    ' + read)
                        var assignment = $('\n\
                            object[' + str(field.name) + '] =               \n\
                                ', read, '')
                        tmp = $('                                           \n\
                            ', tmp, '                                       \n\
                            ', assignment, '                                \n\
                        ')
                    }
                }
            }
        })

        if (range.fixed) tmp = $('                                          \n\
            ', tmp, '                                                       \n\
        ')
    })

    var vars = variables.map(function (variable) {
        return 'var ' + variable
    }).join('\n')

    tmp = $('                                                               \n\
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
    tmp = $('                                                               \n\
            ', composeIncrementalParser(ranges), '                          \n\
            // __blank__                                                    \n\
            return function (buffer, start, end) {                          \n\
                ', tmp, '                                                   \n\
        }')

    console.log($(tmp))

    if (++count ==2) throw new Error

    return tmp
}

function composeIncrementalSerializer (ranges) {
    var tmp, previous = ''
    var variables = [ 'step', 'bite', 'next' ]

    ranges.forEach(function (range, rangeIndex) {
        var offset = 0

        range.pattern.forEach(function (field, patternIndex) {
            if (field.endianness == 'x' && field.padding == null) {
                var section = source()
                var step = (rangeIndex + patternIndex) * 2
                section('\
                    case $initiationStep:                                   \n\
                        skip = start + $skip                                \n\
                        step = $parseStep                                   \n\
                    case $parseStep:                                        \n\
                        if (end < skip) {                                   \n\
                            return end                                      \n\
                        }                                                   \n\
                        start = skip                                        \
                ')
                hoist('skip')
                section.$initiationStep(step)
                section.$skip(field.bytes * field.repeat)
                section.$parseStep(step + 1)
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
                var step = (rangeIndex + patternIndex) * 2

                variables.push(name)

                tmp = $('\
                    ', previous, '                                          \n\
                    case ' + step + ':                                      \n\
                        ', init, '                                          \n\
                        index = ' + (step + 1) + '                          \n\
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
                var step = (rangeIndex + patternIndex) * 2
                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bits = field.bits
                var bite = little ? 0 : bytes - 1
                var direction = little ? 'bite++' : 'bite--'
                var stop = little ? bytes : -1
                var init, assign

                if (field.type == 'f') {
                    init = $('\n\
                        ' + name + ' = new ArrayBuffer(' + bytes + ')       \n\
                        new DataView(' + name + ').setFloat' + bits +
                            '(0, object[' + key + '], true)                 \n\
                    ')
                    assign = name + '[bite]'
                    variables.push(name)
                } else if (field.packing) {
                    name = 'value'
                    init = packForSerialization(variables, field)
                    // todo: DRY
                    assign = name + ' >>> bite * 8 & 0xff'
                } else if (field.padding == null) {
                    variables.push(name)
                    init = name + ' = object[' + str(field.name) + ']'
                    // todo: DRY see above
                    if (field.arrayed) {
                        name = name + '[i]'
                        init += '\ni = 0'
                    }
                    assign = name + ' >>> bite * 8 & 0xff'
                } else {
                    section.$initialization('                               \n\
                            $variable = 0x$padding                          \n\
                    ')
                    section.$padding(field.padding.toString(16))
                    var variable = 'value'
                }

                var compose = $('\n\
                    while (bite != ' + stop + ') {                      \n\
                       if (start == end) {                              \n\
                           return start                                 \n\
                       }                                                \n\
                       buffer[start++] = ' + assign + '                 \n\
                       ' + direction + '                                \n\
                    }                                                   \
                ')

                if (field.arrayed) {
                    compose = $('\n\
                        do {                                                \n\
                            ', compose, '                                   \n\
                            bite = ' + bite + '                             \n\
                        } while (++i < ' + field.repeat + ')                \n\
                    ')
                }

                // todo: bad indent on while loop below.
                tmp = $('\
                    ', previous, '                                          \n\
                    case ' + step + ':                                      \n\
                        ', init, '                                          \n\
                        bite = ' + bite + '                                 \n\
                        step = ' + (step + 1) + '                           \n\
                    case ' + (step + 1) + ':                                \n\
                        ', compose, '                                       \n\
                ')
            }
        })
    })

    tmp = $('\
            switch (step) {                                                \n\
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

    // TODO: Add a `var next` here.
    tmp = $('                                                               \n\
        this.write = function (buffer, start, end) {                        \n\
            ', tmp, '                                                       \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        return this.write(buffer, start, end)                               \n\
    ')

    var vars = variables.map(function (variable) {
        return 'var ' + variable
    }).join('\n')

    tmp = $('                                                               \n\
        var inc                                                             \n\
        // __blank__                                                        \n\
        inc = function (buffer, start, end, step) {                         \n\
            ', vars, '                                                      \n\
            // __blank__                                                    \n\
            ', tmp, '                                                       \n\
        }                                                                   \n\
    ')

    return tmp
}

var count = 0

function pack (value, bits, offset, size) {
    var mask = 0xffffffff, shift
    mask = mask >>> 32 - bits
    mask = mask >>> bits - size
    shift = bits - offset - size
    mask = mask << shift >>> 0
    var source = shift
               ? value + ' << ' + shift + ' & 0x' + mask.toString(16)
               : value + ' & 0x' + mask.toString(16)
    return !offset && bits == 32 ? '(' + source + ') >>> 0' : source
}

function packForSerialization (variables, field) {
    variables.push('value')
    var signage
    var sum
    var bits = field.bytes * 8
    var bit = 0
    var assign = ' = '
    var first = true
    var assignment
    var packing = field.packing.filter(function (pack) {
        pack.offset = bit
        bit += pack.bits
        return pack.endianness != 'x' || pack.padding != null
    })
    var packed = packing.map(function (field, index) {
        var packed = pack('object[' + str(field.name) + ']', bits, field.offset, field.bits)
        if (packing.length > 1) {
            return '(' + packed + ')'
        } else {
            return packed
        }
        if (pack.signed) {
            if (!signage) signage = source()
            var mask = '0xff' + new Array(field.bytes).join('ff')
            var sign = source('\
                _$field = object[$name]                                     \n\
                if (_$field < 0)                                            \n\
                    _$field = 0x$bits + _$field + 1                         \
            ')
            sign.$field(pack.name)
            sign.$name(JSON.stringify(pack.name))
            sign.$bits((mask >>> (field.bits - pack.bits)).toString(16))
            signage(sign)
        }
        if (index == 0) {
            if (packing.length == 1) {
                assignment = source('\
                                                                            \n\
                    $signage                                                \n\
                    value = $sum                                            \n\
                ')
            } else {
                assignment = source('\
                                                                            \n\
                    $signage                                                \n\
                    value =                                                 \n\
                        $sum                                                \n\
                ')
            }
            sum = new source()
            hoist('value')
        }
        var fiddle = source()
        if (packing.length == 1) {
            fiddle = new source('$value << $bits')
        } else {
            fiddle = new source('($value << $bits) +')
        }
        if (pack.signed) {
            fiddle.$value('_' + pack.name)
            hoist('_' + pack.name)
        } else if (pack.padding == null) {
            fiddle.$value('object[$name]')
            fiddle.$name(JSON.stringify(pack.name))
        } else {
            fiddle.$value('0x$padding')
            fiddle.$padding(pack.padding.toString(16))
        }
        fiddle.$bits(field.bits - (pack.offset + pack.bits))
        if (sum) {
            sum(fiddle)
        }
        return
        var line = ''
        var reference = 'object[' + JSON.stringify(pack.name) + ']'
        var mask = '0xff' + new Array(field.bytes).join('ff')
        if (pack.endianness != 'x' || pack.padding != null) {
            if (pack.padding != null) {
                reference = '0x' + pack.padding.toString(16)
            }
            if (first) {
                if (pack.signed) {
                    hoist('unsigned')
                }
                first = false
            } else {
            }
            if (pack.signed) {
                //var bits = '0x' + (mask >>> (field.bits - pack.bits)).toString(16)
                // todo: not honoring top.
                var top = '0x' + (1 << pack.bits - 1).toString(16)
                section.line('unsigned = ' + reference)
                section.line('unsigned = unsigned < 0 ?')
                section.text(' (', bits, ' + unsigned + 1)')
                section.text(' : unsigned')
                reference = 'unsigned'
            }
            line += reference + ' << ' + (field.bits - (bit + pack.bits))
            line += ') +'
            section.line(line)
        }
        bit += pack.bits
    })
    packed = $('                                                            \n\
        value =                                                             \n\
            ', packed.join(' +\n'), '                                       \n\
    ')
    return packed
}


exports.composeSerializer = function (ranges) {
    var variables = [ 'next' ]
    var tmp

    ranges.forEach(function (range) {
        var offset = 0

        tmp = $('\n\
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
                    copy.push('buffer[start++] = ' + name + '[' + index + ']')
                    offset++
                    bite += direction
                    index += direction
                }
                copy = copy.join('\n')

                tmp = $('                                                   \n\
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
                    tmp = $('                                               \n\
                        ', tmp, '\n\
                        buffer[start++] = object[' + str(field.name) + ']   \n\
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
                    } else if (field.padding == null) {
                        variables.push('value')
                        if (field.arrayed) {
                            variables.push('array', 'i', 'I')
                            array = 'array = object[' + str(field.name) + ']'
                            variable = 'value = array[i]'
                        } else {
                            variable = 'value = object[' + str(field.name) + ']'
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
                        tmp = $('                                           \n\
                            ', tmp, '                                       \n\
                            ', array, '                                     \n\
                            for (i = 0; i < ' + field.repeat + '; i++) { \n\
                                ', variable, '                                  \n\
                                ', bites, '                                     \n\
                            } \n\
                            // __blank__                                    \n\
                            ')
                    } else {
                        tmp = $('                                           \n\
                            ', tmp, '                                       \n\
                            ', variable, '                                  \n\
                            ', bites, '                                     \n\
                            // __blank__                                    \n\
                            ')
                    }
                }
            }
        })

        if (range.fixed) tmp = $('                                          \n\
            ', tmp, '                                                       \n\
        ')
    })

    var vars = variables.map(function (variable) {
        return 'var ' + variable
    }).join('\n')

    tmp = $('                                                               \n\
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
