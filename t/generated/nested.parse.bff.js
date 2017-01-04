module.exports = function (parsers) {
    parsers.bff.object = function () {
    }

    parsers.bff._inc = function (buffer, start, end, stack) {
        var parser = new parsers.inc.object
        return 1
    }

    parsers.bff.object.prototype.parse = function (buffer, start, end) {

        var i
        var length
        var object
        var object1

        object = {
            values: new Array
        }

        if (end - start < 2) {
            var parser = new parsers.inc.object
            parser.step = 1
            parser.stack = [{
                object: object
            }, {
                object: object
            }]
            parser.object = object
            return { start: start, parser: parser, object: null }
        }

        length =
            buffer[start++] * 0x100 +
            buffer[start++]

        for (i = 0; i < length; i++) {
            object1 = {
                key: null,
                value: null
            }

            if (end - start < 4) {
                var parser = new parsers.inc.object
                parser.step = 3
                parser.stack = [{
                    object: object
                }, {
                    length: length,
                    index: i,
                    object: object
                }]
                parser.object = object
                return { start: start, parser: parser, object: null }
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
}
