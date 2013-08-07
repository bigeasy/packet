var source = require('source')

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
