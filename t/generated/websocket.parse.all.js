module.exports = function (parsers) {
    parsers.all.object = function () {
    }

    parsers.all.object.prototype.parse = function (buffer, start) {

        var object
        var object1
        var value

        object = {
            header: null
        }

        object.header = object1 = {
            fin: null,
            rsv1: null,
            rsv2: null,
            rsv3: null,
            opcode: null,
            mask: null,
            length: null
        }

        value =
            buffer[start++] * 0x100 +
            buffer[start++]

        object1.fin = value >>> 15 & 0x1
        object1.rsv1 = value >>> 14 & 0x1
        object1.rsv2 = value >>> 13 & 0x1
        object1.rsv3 = value >>> 12 & 0x1
        object1.opcode = value >>> 8 & 0xf
        object1.mask = value >>> 7 & 0x1
        object1.length = value & 0x7f

        if (object.header.length == 127) {
            object.length =
                buffer[start++] * 0x100 +
                buffer[start++]
        } else if (object.header.length == 126) {
            object.length =
                buffer[start++] * 0x1000000 +
                buffer[start++] * 0x10000 +
                buffer[start++] * 0x100 +
                buffer[start++]
        }

        if (object.header.mask == 1) {
            object.mask =
                buffer[start++] * 0x100 +
                buffer[start++]
        }

        return { start: start, object: object, parser: null }
    }
}
