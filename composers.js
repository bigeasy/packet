var source = require('source')

exports.composeParser = function (ranges) {
    var parser = source()

    ranges.forEach(function (range) {
        var section = source()

        section(function () {
            if (end - start < $size) {
                inc.call(buffer, start, end, $patternIndex)
            }
        })

        section.$patternIndex(range.patternIndex)
        section.$size(range.size)

        range.pattern.forEach(function (field, index) {
            var assignment = source()
            assignment(function () {

                $variable = buffer[$index]
            })
            assignment.$index('start')
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

        callback(object)

        return start
    })

    var constructor = source(function () {
        $.var(inc)
    }, function () {

        inc = function (buffer, start, end, index) {
            incremental.call(this, buffer, start, end, pattern, index, object, callback)
        }

        return $parser
    })
    constructor.$parser(parser.define('buffer', 'start', 'end'))

    return String(constructor)
}

exports.composeSerializer = function (ranges) {
    var serializer = source()

    ranges.forEach(function (range) {
        var section = source()

        section(function () {
            if (end - start < $size) {
                inc.call(buffer, start, end, $patternIndex)
            }
        })

        section.$patternIndex(range.patternIndex)
        section.$size(range.size)

        range.pattern.forEach(function (field, index) {
            var assignment = source()
            assignment(function () {

                buffer[$index] = $fiddle
            })
            assignment.$index('start')
            assignment.$fiddle(function () { object[$name] })
            assignment.$name(JSON.stringify(field.name))
            section(String(assignment))
        })

        if (range.fixed) section(function () {

            start += $size
        })

        serializer(String(section))
    })

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
            incremental.call(this, buffer, start, end, pattern, index, object, callback)
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
