module.exports = function (parsers) {
    parsers.all.object = function () {
    }

    parsers.all.object.prototype.parse = function (buffer, start) {

        var object

        object = {
            word: null
        }

        object.word =
            buffer[start++] * 0x100 +
            buffer[start++]

        return { start: start, object: object, parser: null }
    }
}
