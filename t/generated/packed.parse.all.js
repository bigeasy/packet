module.exports = function (parsers) {
    parsers.all.object = function () {
    }

    parsers.all.object.prototype.parse = function (buffer, start) {

        var object
        var value

        object = {
            first: null,
            second: null,
            third: null
        }

        value =
            buffer[start++] * 0x100 +
            buffer[start++]

        object.first = value >>> 15 & 0x1
        object.second = value >>> 12 & 0x7
        object.third = value & 0xfff

        return { start: start, object: object, parser: null }
    }
}
