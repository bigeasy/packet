module.exports = function (parsers) {
    parsers.all.object = function () {
    }

    parsers.all.object.prototype.parse = function (buffer, start) {

        var object

        object = {
            integer: null
        }

        object.integer =
            buffer[start++] * 0x1000000 +
            buffer[start++] * 0x10000 +
            buffer[start++] * 0x100 +
            buffer[start++]

        return { start: start, object: object, parser: null }
    }
}
