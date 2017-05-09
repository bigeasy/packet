module.exports = function (serializers) {
    serializers.all.frame = function (object) {
        this.object = object
    }

    serializers.all.frame.prototype.serialize = function (buffer, start) {

        var object = this.object


        buffer[start++] = object.packet >>> 24 & 0xff
        buffer[start++] = object.packet >>> 16 & 0xff
        buffer[start++] = object.packet >>> 8 & 0xff
        buffer[start++] = object.packet & 0xff

        buffer[start++] = object.length >>> 24 & 0xff
        buffer[start++] = object.length >>> 16 & 0xff
        buffer[start++] = object.length >>> 8 & 0xff
        buffer[start++] = object.length & 0xff

        return { start: start, serializer: null }
    }

    serializers.all.descriptor = function (object) {
        this.object = object
    }

    serializers.all.descriptor.prototype.serialize = function (buffer, start) {

        var object = this.object

        var value

        value = new Buffer(object.uuid, "utf8")
        for (var i = 0, I = value.length; i < I; i++) {
            buffer[start++] = value[i]
        }
        value = [0]
        for (var i = 0, I = value.length; i < I; i++) {
            buffer[start++] = value[i]
        }

        value = new Buffer(object.name, "utf8")
        for (var i = 0, I = value.length; i < I; i++) {
            buffer[start++] = value[i]
        }
        value = [0]
        for (var i = 0, I = value.length; i < I; i++) {
            buffer[start++] = value[i]
        }

        buffer[start++] = object.manufacturerNumber >>> 24 & 0xff
        buffer[start++] = object.manufacturerNumber >>> 16 & 0xff
        buffer[start++] = object.manufacturerNumber >>> 8 & 0xff
        buffer[start++] = object.manufacturerNumber & 0xff

        buffer[start++] = object.productType >>> 24 & 0xff
        buffer[start++] = object.productType >>> 16 & 0xff
        buffer[start++] = object.productType >>> 8 & 0xff
        buffer[start++] = object.productType & 0xff

        buffer[start++] = object.productNumber >>> 24 & 0xff
        buffer[start++] = object.productNumber >>> 16 & 0xff
        buffer[start++] = object.productNumber >>> 8 & 0xff
        buffer[start++] = object.productNumber & 0xff

        return { start: start, serializer: null }
    }
}
