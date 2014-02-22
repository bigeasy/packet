var source = require('source')
var __slice = [].slice

function hoister () {
    var user = []
    var system = []
    return function () {
        __slice.call(arguments).forEach(function (variable) {
            var collection = variable[0] == '_' ? user : system
            if (!~collection.indexOf(variable)) {
                collection.push(variable)
            }
        })
        return system.concat(user).map(function (variable) {
            return 'var ' + variable
        }).join('\n')
    }
}

function fixupSignage (field, operation) {
    operation('\
        _$field = _$field & $sign ? ($mask - _$field + 1) * -1 : _$field  \n\
    ')
    operation.$sign('0x80' + new Array(field.bytes).join('00'))
    operation.$mask('0xff' + new Array(field.bytes).join('ff'))
}

function composeIncrementalParser (ranges) {
    var cases = source()

    var hoist = hoister()
    hoist('next')

    ranges.forEach(function (range, rangeIndex) {

        range.pattern.forEach(function (field, patternIndex) {
            var index = (rangeIndex + patternIndex) * 2
            if (field.endianness == 'x') {
                var section = source()
                var index = (rangeIndex + patternIndex) * 2
                section('\n\
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

                hoist('_' + field.name)

                section('\
                    case $initiationIndex:                                  \n\
                        $initialization                                     \n\
                        index = $parseIndex                                 \n\
                    case $parseIndex:                                       \n\
                        $parse                                              \n\
                        object[$name] = $extract                            \
                ')
                section.$initiationIndex(index)

                section.$initialization('\n\
                        _$field = new ArrayBuffer($size)                    \n\
                        bite = $start                                       \n\
                ')
                section.$start(bite)
                section.$size(field.bytes)
                section.$field(field.name)
                section.$parseIndex(index + 1)

                var operation = source()

                operation('\n\
                    while (bite != $stop) {                                 \n\
                        if (start == end) {                                 \n\
                            return start                                    \n\
                        }                                                   \n\
                        _$field[$direction] = buffer[start++]               \n\
                    }')

                operation.$field(field.name)
                operation.$stop(stop)
                operation.$direction(direction < 0 ? 'bite--' : 'bite++')

                section.$parse(operation)
                section.$name(JSON.stringify(field.name))
                section.$extract('new DataView(_$field).getFloat$bits(0, true)')
                section.$bits(field.bits)
                cases(section)
            } else {
                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bite = little ? 0 : bytes - 1
                var direction = little ? 1 : -1
                var stop = little ? bytes : -1
                var section = source()

                hoist('_' + field.name)

                section('\
                    case $initiationIndex:                                  \n\
                        $initialization                                     \n\
                        index = $parseIndex                                 \n\
                    case $parseIndex:                                       \n\
                        $parse                                              \
                ')
                section.$initiationIndex(index)

                section.$initialization('\n\
                        _$field = 0                                         \n\
                        bite = $start                                       \n\
                ')
                section.$start(bite)

                section.$field(field.name)
                section.$parseIndex(index + 1)
                var operation = source()

                operation('\n\
                    while (bite != $stop) {                                 \n\
                        if (start == end) {                                 \n\
                            return start                                    \n\
                        }                                                   \n\
                        _$field += Math.pow(256, bite) * buffer[start++]    \n\
                        $direction                                          \n\
                    }')
                if (field.signed) {
                    fixupSignage(field, operation)
                }
                operation('\
                    object[$name] = _$field \n\
                ')
                operation.$stop(stop)
                operation.$name(JSON.stringify(field.name))
                operation.$field(field.name)
                operation.$direction(direction < 0 ? 'bite--' : 'bite++')
                section.$parse(operation)
                cases(section)
            }
        })

    })

     var parser = source()
     parser('\
        switch (index) {                                                    \n\
        $cases                                                              \n\
        }                                                                   \n\
                                                                            \n\
        if (next = callback(object)) {                                      \n\
            this.parse = next                                               \n\
            return this.parse(buffer, start, end)                           \n\
        }                                                                   \n\
                                                                            \n\
        return start                                                        \n\
    ')
    parser.$cases(cases)

    var builder = source()

    builder('\n\
        var bite                                                            \n\
        $variables                                                          \n\
                                                                            \n\
        this.parse = $parser                                                \n\
                                                                            \n\
        return this.parse(buffer, start, end)                               \n\
    ')
    builder.$variables(hoist())
    builder.$parser(parser.define('buffer', 'start', 'end'))

    return 'inc = ' + builder.define('buffer', 'start', 'end', 'index')
}

exports.composeParser = function (ranges) {
    var sections = source()

    var hoist = hoister()
    hoist('next')

    ranges.forEach(function (range) {
        var section = source()

        section('\n\
            if (end - start < $size) {                                      \n\
                return inc.call(this, buffer, start, end, $patternIndex)    \n\
            }                                                               \
        ')

        section.$patternIndex(range.patternIndex)
        section.$size(range.size)

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
                var assignment = source()
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

                    var read = source()
                    while (bite != stop) {
                        var fiddle = source()
                        if (bite) {
                            fiddle('buffer[$inc] * $power +')
                            fiddle.$power('0x' + Math.pow(256, bite).toString(16))
                        } else {
                            fiddle('buffer[$inc] +')
                        }

                        fiddle.$inc(offset == 0 ? 'start' : 'start + $offset')
                        fiddle.$offset && fiddle.$offset(offset)
                        offset++
                        //previous.$next(String(read))
                        read(String(fiddle))
                        bite += direction
                    }
                    assignment('\n\
                        $variable =                                         \n\
                            $read                                           \n\
                    ')
                    if (field.signed) {
                        assignment.$variable('_$field')
                        assignment.$field(field.name)
                        hoist('_' + field.name)
                        fixupSignage(field, assignment)
                        assignment('\
                            object[$name] = _$field \n\
                        ')
                    } else {
                        assignment.$variable('object[$name]')
                        assignment.$name(JSON.stringify(field.name))
                    }
                    read = String(read).replace(/ \+$/, '')
                    assignment.$read(read)
                }
                assignment.$name(JSON.stringify(field.name))
                section(assignment)
            }
        })

        if (range.fixed) section('\n\
            start += $size                                                  \n\
        ')

        sections(section)
    })

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

    var constructor = source('\
        var inc                                                             \n\
                                                                            \n\
        $incremental                                                        \n\
                                                                            \n\
        return $parser                                                      \
    ')

    constructor.$incremental(composeIncrementalParser(ranges))

    constructor.$parser(parser.define('buffer', 'start', 'end'))

    return String(constructor)
}

function composeIncrementalSerializer (ranges) {
    var cases = source()

    var hoist = hoister()
    hoist('next')

    ranges.forEach(function (range, rangeIndex) {
        var section = source()
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
                var section = source()
                var index = (rangeIndex + patternIndex) * 2
                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bite = little ? 0 : bytes - 1
                var direction = little ? 1 : -1
                var stop = little ? bytes : -1

                section('\
                    case $initiationIndex:                                  \n\
                        $initialization                                     \n\
                        bite = $start                                       \n\
                        index = $parseIndex                                 \n\
                    case $parseIndex:                                       \n\
                        $parse                                              \
                ')
                section.$initiationIndex(index)

                if (field.packing) {
                    variable = 'value'
                    section.$initialization(packForSerialization(hoist, field))
                } else if (field.padding == null) {
                    section.$initialization('\n\
                            $variable = object[$name]                       \n\
                    ')
                    var variable = '_' + field.name
                    section.$name(JSON.stringify(field.name))
                } else {
                    section.$initialization('\n\
                            $variable = 0x$padding                          \n\
                    ')
                    section.$padding(field.padding.toString(16))
                    var variable = 'value'
                }
                hoist(variable)
                section.$start(bite)
                section.$parseIndex(index + 1)

                section.$parse('\n\
                   while (bite != $stop) {                                  \n\
                        if (start == end) {                                 \n\
                            return start                                    \n\
                        }                                                   \n\
                        buffer[start++] = $variable >>> bite * 8 & 0xff     \n\
                        $direction                                          \n\
                    }                                                       \
                ')
                section.$variable(variable)
                section.$stop(stop)
                section.$direction(direction < 0 ? 'bite--' : 'bite++')

                cases(section)
            }
        })
    })

    var serializer = source('\
        switch (index) {                                                    \n\
        $cases                                                              \n\
        }                                                                   \n\
                                                                            \n\
        if (next = callback && callback(object)) {                          \n\
            this.write = next                                               \n\
            return this.write(buffer, start, end)                           \n\
        }                                                                   \n\
                                                                            \n\
        return start                                                        \n\
    ')
    serializer.$cases(cases)

    var incremental = source('\
        var index                                                           \n\
        var bite                                                            \n\
        $variables                                                          \n\
                                                                            \n\
        this.write = $serializer                                            \n\
                                                                            \n\
        return this.write(buffer, start, end)                               \n\
    ')
    incremental.$serializer(serializer.define('buffer', 'start', 'end'))
    incremental.$variables(hoist())

    return incremental.define('buffer', 'start', 'end', 'index')
}

function packForSerialization (hoist, field) {
    hoist('value')
    var signage
    var sum
    var bit = 0
    var assign = ' = '
    var first = true
    var assignment
    var packing = field.packing.filter(function (pack) {
        pack.offset = bit
        bit += pack.bits
        return pack.endianness != 'x' || pack.padding != null
    })
    packing.forEach(function (pack, index) {
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
                var bits = '0x' + (mask >>> (field.bits - pack.bits)).toString(16)
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
    assignment.$signage(signage || '')
    assignment.$sum && assignment.$sum(String(sum).replace(/ \+$/, ''))
    return assignment
}

exports.composeSerializer = function (ranges) {
    var sections = source()

    var hoist = hoister()
    hoist('next')

    ranges.forEach(function (range) {
        var section = source()
        var offset = 0

        section('\n\
            if (end - start < $size) {                                      \n\
                return inc.call(this, buffer, start, end, $patternIndex)    \n\
            }                                                               \n\
        ')

        section.$patternIndex(range.patternIndex)
        section.$size(range.size)

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
                var assignment = source()
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
                        hoist('value')
                        assignment('\n\
                            value = object[$name]                           \n\
                        ')
                        assignment.$name(JSON.stringify(field.name))
                    } else {
                        assignment('\n\
                            value = 0x$padding                              \n\
                        ')
                        assignment.$padding(field.padding.toString(16))
                    }
                    while (bite != stop) {
                        var write = source()
                        write(function () {
                            buffer[$inc] = $value & 0xff
                        })
                        write.$inc(offset ? 'start + $offset' : 'start')
                        write.$offset && write.$offset(offset)
                        offset++
                        write.$value(bite ? 'value >>> $shift' : 'value')
                        write.$shift && write.$shift(bite * 8)
                        assignment(String(write))
                        bite += direction
                    }
                }
                section(String(assignment))
            }
        })

        if (range.fixed) section('\n\
            start += $size                                                  \n\
        ')

        sections(String(section))
    })

    var serializer = source()

    if (hoist()) {
        serializer('\n\
            $variables                                                      \n\
        ')
    }

    serializer('\
        $sections                                                           \n\
    ')

    serializer.$variables && serializer.$variables(hoist())
    serializer.$sections(sections)

    serializer('\
        if (next = callback && callback(object)) {                          \n\
            this.write = next                                               \n\
            return this.write(buffer, start, end)                           \n\
        }                                                                   \n\
                                                                            \n\
        return start                                                        \n\
    ')


    var constructor = source('\
        var inc                                                             \n\
                                                                            \n\
        inc = $incremental                                                  \n\
                                                                            \n\
        return $serializer                                                  \
    ')

    constructor.$serializer(serializer.define('buffer', 'start', 'end'))
    constructor.$incremental(composeIncrementalSerializer(ranges))

    return String(constructor)
}

exports.composeSizeOf = function (ranges) {
    var sizeOf = source()

    var fixed = 0

    ranges.forEach(function (range) {
        if (range.fixed) {
            range.pattern.forEach(function (field) {
                fixed += field.bytes * field.repeat
            })
        }
    })

    sizeOf('return $fixed')
    sizeOf.$fixed(fixed)

    return String(sizeOf)
}
