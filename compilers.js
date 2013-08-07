var source = require('source')
var parameters = [ 'incremental', 'terminator', 'pattern', 'transforms', 'ieee754', 'object', 'callback' ]

exports.compileSerializer = function (object, precompiler) {
    var field = object.pattern[0]
    var pattern = object.pattern
    var ranges = [{ size: 0, fixed: true, pattern: [], patternIndex: 0 }]
    var fixed

    pattern.forEach(function (field, index) {
        ranges[0].size += field.bytes * field.repeat
        ranges[0].pattern.push(field)
    })

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
    constructor.$serializer(String(serializer.compile('buffer', 'start', 'end')))

    var serializer = String(constructor).split(/\n/)

    var prefix = [ 'serializer' ]

    return precompiler(prefix.join('.'), pattern, parameters, serializer)
}
