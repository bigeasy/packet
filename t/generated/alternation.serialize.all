module.exports = function (serializers) {
    serializers.all.object = function (object) {
        this.object = object
    }

    serializers.all.object.prototype.serialize = function (buffer, start) {

        var object = this.object

        var select

        select = object.number

        if (128 <= select) {

            buffer[start++] = object.number >>> 8 & 0xff
            buffer[start++] = object.number & 0xff

        } else {

            buffer[start++] = object.number & 0xff

        }

        return { start: start, serializer: null }
    }
}
