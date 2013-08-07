var source = require('source')

exports.composeParser = function (ranges) {
    var parser = source()

    ranges.forEach(function (range) {
        var section = source()

        section(function () {
            if (end - start < $size) {
                return inc.call(this, buffer, start, end, $patternIndex)
            }
        })

        section.$patternIndex(range.patternIndex)
        section.$size(range.size)

        var offset = 0
        range.pattern.forEach(function (field, index) {
            var assignment = source()
            if (field.bytes == 1) {
                assignment(function () {

                    $variable = buffer[$inc]
                })
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
                assignment(function () {

                    $variable =
                        $read
                })
                read = String(read).replace(/ \+$/, '')
                assignment.$read(read)
            }
                assignment.$variable(function () { object[$name] })
                assignment.$name(JSON.stringify(field.name))
            section(String(assignment))
        })

        if (range.fixed) section(function () {

            start += $size
        })

        parser(String(section))
    })

    parser(function () {

        return callback(object)
    })

    var constructor = source(function () {
        $.var(inc)
    }, function () {

        inc = function (buffer, start, end, index) {
            return incremental.call(this, buffer, start, end, pattern, index, object, callback)
        }

        return $parser
    })
    constructor.$parser(parser.define('buffer', 'start', 'end'))

    return String(constructor)
}

exports.composeSerializer = function (ranges) {
    var sections = source()
    var variables = {}

    ranges.forEach(function (range) {
        var section = source()
        var offset = 0

        section(function () {
            if (end - start < $size) {
                return inc.call(this, buffer, start, end, $patternIndex)
            }
        })

        section.$patternIndex(range.patternIndex)
        section.$size(range.size)

        range.pattern.forEach(function (field, index) {
            var assignment = source()
            if (field.bytes == 1) {
                assignment(function () {

                    buffer[$inc] = $fiddle
                })
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
                assignment(function () {

                    value = object[$name]
                })
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

        if (range.fixed) section(function () {

            start += $size
        })

        sections(String(section))
    })

    var serializer = source()

    variables = Object.keys(variables).sort().join(', ')
    if (variables) {
        serializer(function () {
            $.var($variables)
        })
    }

    serializer(function () {

        $sections
    })

    serializer.$variables && serializer.$variables(variables)
    serializer.$sections(String(sections))

    serializer(function () {
        this.write = terminator

        callback()

        if (this.write === terminator) {
            return start
        }

        return this.write(buffer, start, end)
    })

    var constructor = source(function () {
        $.var(inc)
    }, function () {

        inc = function (buffer, start, end, index) {
            return incremental.call(this, buffer, start, end, pattern, index, object, callback)
        }

        return $serializer
    })
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
