module.exports = function (parsers) {
    parsers.all.object = function () {
    }

    parsers.all.object.prototype.parse = function (buffer, start) {

        var object

        object = {
            word: null
        }

        object.word =
            buffer[start++] +
            buffer[start++] * 0x100

        return { start: start, object: object, parser: null }
    }
}
