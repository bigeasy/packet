module.exports = function (serializers) {
    serializers.all.object = function (object) {
        this.object = object
    }

    serializers.all.object.prototype.serialize = function (buffer, start) {

        var object = this.object

        var object1

        object1 = object.header

        buffer[start++] = object1.number >>> 8 & 0xff
        buffer[start++] = object1.number & 0xff

        return { start: start, serializer: null }
    }
}
