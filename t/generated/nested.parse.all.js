module.exports = (function () {
    var parsers = {}

    parsers.object = function () {
    }

    parsers.object.prototype.parse = function (buffer, start) {

        var i
        var length
        var object
        var object1

        object = {
            values: new Array
        }

        length =
            buffer[start++] * 0x100 +
            buffer[start++]

        for (i = 0; i < length; i++) {
            object1 = {
                key: null,
                value: null
            }

            object1.key =
                buffer[start++] * 0x100 +
                buffer[start++]

            object1.value =
                buffer[start++] * 0x100 +
                buffer[start++]

            object.values.push(object1)
        }

        return { start: start, object: object, parser: null }
    }

    return parsers
})()
