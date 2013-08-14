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
        _$field = (_$field & $sign) ? ($mask - _$field + 1) * -1 : _$field      \n\
    ')
    operation.$sign('0x80' + new Array(field.bytes).join('00'))
    operation.$mask('0xff' + new Array(field.bytes).join('ff'))
}

function composeIncrementalParser (ranges) {

    var cases = source();
    var hoist = hoister();

    ranges.forEach(function (range, rangeIndex) {

        range.pattern.forEach(function (field, patternIndex) {
            var index = (rangeIndex + patternIndex) * 2
            if (field.endianness == 'x') {
                var section = source()
                var index = (rangeIndex + patternIndex) * 2
                section('\n\
                    case $initiationIndex:                                      \n\
                        skip = start + $skip                                    \n\
                        index = $parseIndex                                     \n\
                    case $parseIndex:                                           \n\
                        if (end < skip) return end                              \n\
                        start = skip                                            \
                ')
                hoist('skip')
                section.$initiationIndex(index)
                section.$skip(field.bytes * field.repeat)
                section.$parseIndex(index + 1)
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
                    case $initiationIndex:                                      \n\
                        $initialization                                         \n\
                        index = $parseIndex                                     \n\
                    case $parseIndex:                                           \n\
                        $parse                                                  \
                ')
                section.$initiationIndex(index)

                section.$initialization('\n\
                        _$field = 0                                             \n\
                        bite = $start                                           \n\
                ')
                section.$start(bite)

                section.$field(field.name)
                section.$parseIndex(index + 1)
                var operation = source()

                operation('\n\
                    while (bite != $stop) {                                     \n\
                        if (start == end) return start                          \n\
                        _$field += Math.pow(256, bite) * buffer[start++]        \n\
                        $direction                                              \n\
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
        // todo: all wrong                                                  \n\
        return callback(object)                                             \n\
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
            } else {
                var assignment = source()
                if (field.bytes == 1 && ! field.signed) {
                    assignment('\n\
                        $variable = buffer[$inc]                                \n\
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
                        $variable =                                             \n\
                            $read                                               \n\
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
                section(String(assignment))
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
            return callback(object)                                         \n\
        ')
        parser.$variables(hoist())
    } else {
        parser('\n\
            $sections                                                       \n\
                                                                            \n\
            return callback(object)                                         \n\
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

    ranges.forEach(function (range, rangeIndex) {
        var section = source()
        var offset = 0

        range.pattern.forEach(function (field, patternIndex) {
            if (field.endianness == 'x') {
                var section = source()
                var index = (rangeIndex + patternIndex) * 2
                section('\
                    case $initiationIndex:                                      \n\
                        skip = start + $skip                                    \n\
                        index = $parseIndex                                     \n\
                    case $parseIndex:                                           \n\
                        if (end < skip) return end                              \n\
                        start = skip                                            \
                ')
                hoist('skip')
                section.$initiationIndex(index)
                section.$skip(field.bytes * field.repeat)
                section.$parseIndex(index + 1)
                cases(section)
            } else {
                var section = source()
                var index = (rangeIndex + patternIndex) * 2
                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bite = little ? 0 : bytes - 1
                var direction = little ? 1 : -1
                var stop = little ? bytes : -1

                hoist('_' + field.name)

                section('\
                    case $initiationIndex:                                      \n\
                        $initialization                                         \n\
                        index = $parseIndex                                     \n\
                    case $parseIndex:                                           \n\
                        $parse                                                  \
                ')
                section.$initiationIndex(index)

                section.$initialization('\n\
                        _$field = object[$name]                                 \n\
                        bite = $start                                           \n\
                ')
                section.$start(bite)
                section.$name(JSON.stringify(field.name))
                section.$field(field.name)
                section.$parseIndex(index + 1)

                var operation = source()

                operation('\n\
                   while (bite != $stop) {                                     \n\
                        if (start == end) return start                          \n\
                        buffer[start++] = (_$field >>> bite * 8) & 0xff         \n\
                        $direction                                              \n\
                    }                                                           \
                ')
                operation.$stop(stop)
                operation.$field(field.name)
                operation.$direction(direction < 0 ? 'bite--' : 'bite++')
                section.$parse(operation)

                cases(section)
            }
        })
    })

    var serializer = source('\
        switch (index) {                                                    \n\
        $cases                                                              \n\
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

exports.composeSerializer = function (ranges) {
    var sections = source()
    var variables = {}

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
            if (field.endianness == 'x') {
                offset += field.bytes * field.repeat
            } else {
                var assignment = source()
                if (field.bytes == 1) {
                    assignment('\n\
                        buffer[$inc] = $fiddle                                  \n\
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

                    variables.value = true
                    assignment('\n\
                        value = object[$name]                                   \n\
                    ')
                    while (bite != stop) {
                        var write = source()
                        write(function () {
                            buffer[$inc] = $value & 0xff
                        })
                        write.$inc(offset ? 'start + $offset' : 'start')
                        write.$offset && write.$offset(offset)
                        offset++
                        write.$value(bite ? '(value >>> $shift)' : 'value')
                        write.$shift && write.$shift(bite * 8)
                        assignment(String(write))
                        bite += direction
                    }
                    assignment.$name(JSON.stringify(field.name))
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

    variables = Object.keys(variables).sort().join(', ')
    if (variables) {
        serializer('\n\
            var $variables                                                  \n\
        ')
    }

    serializer('\
        $sections                                                           \n\
    ')

    serializer.$variables && serializer.$variables(variables)
    serializer.$sections(sections)

    serializer('\
        this.write = terminator                                             \n\
                                                                            \n\
        callback()                                                          \n\
                                                                            \n\
        if (this.write === terminator) {                                    \n\
            return start                                                    \n\
        }                                                                   \n\
                                                                            \n\
        return this.write(buffer, start, end)                               \n\
    ')


    var constructor = source('\
        var inc                                                             \n\
                                                                            \n\
        inc = $incremental                                                  \n\
                                                                            \n\
        return $serializer                                                  \
    ')

    constructor.$serializer(serializer.define('buffer', 'start', 'end'))
    constructor.$incremental(composeIncrementalSerializer(ranges));

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
