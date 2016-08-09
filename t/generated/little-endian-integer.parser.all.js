module.exports = (function () {
    var parsers = {}

    parsers.object = function () {
    }

    parsers.object.prototype.parse = function (buffer, start) {

        var object

        object = {
            integer: null
        }

        object.integer =
            buffer[start++] +
            buffer[start++] * 0x100 +
            buffer[start++] * 0x10000 +
            buffer[start++] * 0x1000000

        return { start: start, object: object, parser: null }
    }

    return parsers
})()
