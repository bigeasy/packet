module.exports = function (serializers) {
    serializers.all.object = function (object) {
        this.object = object
    }

    serializers.all.object.prototype.serialize = function (buffer, start) {

        var object = this.object

        var array
        var i
        var length
        var object1

        array = object.values
        length = array.length

        buffer[start++] = length >>> 8 & 0xff
        buffer[start++] = length & 0xff

        for (i = 0; i < length; i++) {
            object1 = array[i]
            buffer[start++] = object1.key >>> 8 & 0xff
            buffer[start++] = object1.key & 0xff

            buffer[start++] = object1.value >>> 8 & 0xff
            buffer[start++] = object1.value & 0xff
        }

        return { start: start, serializer: null }
    }
}
