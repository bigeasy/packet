module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        this.object = object
    }

    serializers.bff.object.prototype.serialize = function (buffer, start) {

        var object = this.object



        buffer[start++] = object.integer >>> 8 & 0xff
        buffer[start++] = object.integer & 0xff

        return { start: start, serializer: null }
    }
}
