module.exports = function (parsers) {
    parsers.bff.object = function () {
    }

    parsers.bff.object.prototype.parse = function (buffer, start, end) {

        var object

        object = {
            integer: null
        }

        if (buffer.length < 2) {
            return this._inc(buffer, start, end, [object])
        }

        object.integer =
            buffer[start++] * 0x100 +
            buffer[start++]

        return { start: start, object: object, parser: null }
    }
}
