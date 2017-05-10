module.exports = function (parsers) {
    parsers.all.frame = function () {
    }

    parsers.all.frame.prototype.parse = function (buffer, start) {

        var object

        object = {
            packet: null,
            length: null
        }

        object.packet =
            buffer[start++] * 0x1000000 +
            buffer[start++] * 0x10000 +
            buffer[start++] * 0x100 +
            buffer[start++]

        object.length =
            buffer[start++] * 0x1000000 +
            buffer[start++] * 0x10000 +
            buffer[start++] * 0x100 +
            buffer[start++]

        return { start: start, object: object, parser: null }
    }

    parsers.all.descriptor = function () {
    }

    parsers.all.descriptor.prototype.parse = function (buffer, start) {

        var index
        var object
        var terminator

        object = {
            uuid: null,
            name: null,
            manufacturerNumber: null,
            productType: null,
            productNumber: null
        }

        var terminator = [0]
        var index = buffer.indexOf(new Buffer(terminator), start)
        object.uuid = buffer.toString(undefined, start, index)
        start = index + terminator.length

        var terminator = [0]
        var index = buffer.indexOf(new Buffer(terminator), start)
        object.name = buffer.toString(undefined, start, index)
        start = index + terminator.length

        object.manufacturerNumber =
            buffer[start++] * 0x1000000 +
            buffer[start++] * 0x10000 +
            buffer[start++] * 0x100 +
            buffer[start++]

        object.productType =
            buffer[start++] * 0x1000000 +
            buffer[start++] * 0x10000 +
            buffer[start++] * 0x100 +
            buffer[start++]

        object.productNumber =
            buffer[start++] * 0x1000000 +
            buffer[start++] * 0x10000 +
            buffer[start++] * 0x100 +
            buffer[start++]

        return { start: start, object: object, parser: null }
    }

    parsers.all.device = function () {
    }

    parsers.all.device.prototype.parse = function (buffer, start) {

        var i
        var index
        var length
        var object
        var object1
        var terminator

        object = {
            attributes: new Array
        }

        length =
            buffer[start++] * 0x1000000 +
            buffer[start++] * 0x10000 +
            buffer[start++] * 0x100 +
            buffer[start++]

        for (i = 0; i < length; i++) {
            object1 = {
                attributeId: null,
                value: null
            }

            object1.attributeId =
                buffer[start++] * 0x1000000 +
                buffer[start++] * 0x10000 +
                buffer[start++] * 0x100 +
                buffer[start++]

            var terminator = [0]
            var index = buffer.indexOf(new Buffer(terminator), start)
            object1.value = buffer.toString(undefined, start, index)
            start = index + terminator.length

            object.attributes.push(object1)
        }

        return { start: start, object: object, parser: null }
    }
}
