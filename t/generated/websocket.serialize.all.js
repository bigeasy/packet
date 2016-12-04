module.exports = function (serializers) {
    serializers.all.object = function (object) {
        this.object = object
    }

    serializers.all.object.prototype.serialize = function (buffer, start) {

        var object = this.object

        var object1
        var value

        object1 = object.header

        value =
            (object1.fin << 15 & 0x8000) |
            (object1.rsv1 << 14 & 0x4000) |
            (object1.rsv2 << 13 & 0x2000) |
            (object1.rsv3 << 12 & 0x1000) |
            (object1.opcode << 8 & 0xf00) |
            (object1.mask << 7 & 0x80) |
            (object1.length & 0x7f)

        buffer[start++] = value >>> 8 & 0xff
        buffer[start++] = value & 0xff

        if (object.header.length == 127) {
            buffer[start++] = object.length >>> 8 & 0xff
            buffer[start++] = object.length & 0xff
        } else if (object.header.length == 126) {
            buffer[start++] = object.length >>> 24 & 0xff
            buffer[start++] = object.length >>> 16 & 0xff
            buffer[start++] = object.length >>> 8 & 0xff
            buffer[start++] = object.length & 0xff
        }

        if (object.header.mask == 1) {
            buffer[start++] = object.mask >>> 8 & 0xff
            buffer[start++] = object.mask & 0xff
        }

        return { start: start, serializer: null }
    }
}
