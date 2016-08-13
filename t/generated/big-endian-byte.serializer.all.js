module.exports = function (serializers) {
    serializers.all.object = function (object) {
        this.object = object
    }

    serializers.all.object.prototype.serialize = function (buffer, start) {

        var object = this.object


        buffer[start++] = object.word & 0xff

        return { start: start, serializer: null }
    }
}
