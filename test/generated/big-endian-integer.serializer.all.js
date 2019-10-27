module.exports = function (serializers) {
    serializers.all.object = function (object) {
        this.object = object
    }

    serializers.all.object.prototype.serialize = function (buffer, start) {

        var object = this.object



        buffer[start++] = object.integer >>> 24 & 0xff
        buffer[start++] = object.integer >>> 16 & 0xff
        buffer[start++] = object.integer >>> 8 & 0xff
        buffer[start++] = object.integer & 0xff

        return { start: start, serializer: null }
    }
}
