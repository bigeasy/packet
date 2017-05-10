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

        var I
        var i
        var object

        object = new Buffer(object.uuid, "utf8")
        for (var i = 0, I = object.length; i < I; i++) {
            buffer[start++] = object[i]
        }
        object = [0]
        for (var i = 0, I = object.length; i < I; i++) {
            buffer[start++] = object[i]
        }

        object = new Buffer(object.name, "utf8")
        for (var i = 0, I = object.length; i < I; i++) {
            buffer[start++] = object[i]
        }
        object = [0]
        for (var i = 0, I = object.length; i < I; i++) {
            buffer[start++] = object[i]
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

    serializers.all.device = function (object) {
        this.object = object
    }

    serializers.all.device.prototype.serialize = function (buffer, start) {

        var object = this.object

        var I1
        var array
        var i
        var i1
        var length
        var object1

        array = object.attributes
        length = array.length

        buffer[start++] = length >>> 24 & 0xff
        buffer[start++] = length >>> 16 & 0xff
        buffer[start++] = length >>> 8 & 0xff
        buffer[start++] = length & 0xff

        for (i = 0; i < length; i++) {
            object1 = array[i]
            buffer[start++] = object1.attributeId >>> 24 & 0xff
            buffer[start++] = object1.attributeId >>> 16 & 0xff
            buffer[start++] = object1.attributeId >>> 8 & 0xff
            buffer[start++] = object1.attributeId & 0xff

            object1 = new Buffer(object1.value, "utf8")
            for (var i1 = 0, I1 = object1.length; i1 < I1; i1++) {
                buffer[start++] = object1[i1]
            }
            object1 = [0]
            for (var i1 = 0, I1 = object1.length; i1 < I1; i1++) {
                buffer[start++] = object1[i1]
            }
        }

        return { start: start, serializer: null }
    }
}
