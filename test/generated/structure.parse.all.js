module.exports = function (parsers) {
    parsers.all.object = function () {
    }



    parsers.all.object.prototype.parse = function (buffer, start) {


        var object
        var object1

        object = {
            header: null
        }

        object.header = object1 = {
            number: null
        }

        object1.number =
            buffer[start++] * 0x100 +
            buffer[start++]

        return { start: start, object: object, parser: null }
    }
}
