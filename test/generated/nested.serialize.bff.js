module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        this.object = object
    }

    serializers.bff.object.prototype.serialize = function (buffer, start, end) {

        var object = this.object

        var array
        var i
        var length
        var object1
        var serializer

        if (end - start < 2) {
            serializer = new serializers.inc.object
            serializer.step = 0
            serializer.stack = [{
                length: length,
                index: i || 0,
                object: object
            }]
            return { start: start, serializer: serializer }
        }

        array = object.values
        length = array.length

        buffer[start++] = length >>> 8 & 0xff
        buffer[start++] = length & 0xff

        for (i = 0; i < length; i++) {
            object1 = array[i]
            if (end - start < 4) {
                serializer = new serializers.inc.object
                serializer.step = 2
                serializer.stack = [{
                    length: length,
                    index: i || 0,
                    object: object
                }]
                return { start: start, serializer: serializer }
            }

            buffer[start++] = object1.key >>> 8 & 0xff
            buffer[start++] = object1.key & 0xff

            buffer[start++] = object1.value >>> 8 & 0xff
            buffer[start++] = object1.value & 0xff
        }

        return { start: start, serializer: null }
    }
}
