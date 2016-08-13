module.exports = function (parsers) {
    parsers.all.object = function () {
    }

    parsers.all.object.prototype.parse = function (buffer, start) {

        var object
        var select

        object = {
            number: null
        }

        select = buffer[start++]
        start -= 1

        if (select & 0x80) {

            object.number =
                buffer[start++] * 0x100 +
                buffer[start++]

        } else {

            object.number = buffer[start++]

        }

        return { start: start, object: object, parser: null }
    }
}
