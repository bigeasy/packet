var source = require('source')

function composeIncrementalParser (ranges) {

    var cases = source();
    var variables = source()

    ranges.forEach(function (range, rangeIndex) {

        range.pattern.forEach(function (field, patternIndex) {
            var little = field.endianness == 'l'
            var bytes = field.bytes
            var bite = little ? 0 : bytes - 1
            var direction = little ? 1 : -1
            var stop = little ? bytes : -1
            var section = source()
            var index = (rangeIndex + patternIndex) * 2

            var variable = source('var _$field')
            variable.$field(field.name)
            variables(variable)

            section('\n\
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
                }                                                           \n\
                object[$name] = _$field')
            operation.$stop(stop)
            operation.$name(JSON.stringify(field.name))
            operation.$field(field.name)
            operation.$direction(direction < 0 ? 'bite--' : 'bite++')
            section.$parse(operation)
            cases(section)
        })

    })

     var parser = source()
     parser('\n\
        switch (index) {                                                    \
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
    builder.$variables(variables)
    builder.$parser(parser.define('buffer', 'start', 'end'))

    return 'inc = ' + builder.define('buffer', 'start', 'end', 'index')
}

exports.composeParser = function (ranges) {
    var parser = source()

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
            var assignment = source()
            if (field.bytes == 1) {
                assignment('\n\
                    $variable = buffer[$inc]                                \n\
                ')
                assignment.$inc(offset ? 'start + $offset' : 'start')
                assignment.$offset && assignment.$offset(offset)
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
                read = String(read).replace(/ \+$/, '')
                assignment.$read(read)
            }
                assignment.$variable(function () { object[$name] })
                assignment.$name(JSON.stringify(field.name))
            section(String(assignment))
        })

        if (range.fixed) section('\n\
            start += $size                                                  \n\
        ')

        parser(String(section))
    })

    parser('\n\
        return callback(object)                                             \n\
    ')

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
        inc = function (buffer, start, end, index) {                        \n\
            return null                                                     \n\
        }                                                                   \n\
                                                                            \n\
        return $serializer                                                  \
    ')

    constructor.$serializer(serializer.define('buffer', 'start', 'end'))

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
