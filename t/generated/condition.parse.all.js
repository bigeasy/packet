module.exports = function (parsers) {
    parsers.all.object = function () {
    }



    parsers.all.object.prototype.parse = function (buffer, start) {


        var object

        object = {
            flag: null
        }

        object.flag =
            buffer[start++] * 0x100 +
            buffer[start++]


        if (object.flag == 16) {
            object.number =
                buffer[start++] * 0x100 +
                buffer[start++]
        } else {
            object.number = buffer[start++]
        }

        return { start: start, object: object, parser: null }
    }
}
