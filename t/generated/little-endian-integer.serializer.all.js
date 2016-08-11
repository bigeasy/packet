module.exports = (function () {
    var serializers = {}

    serializers.object = function (object) {
        this.object = object
    }

    serializers.object.prototype.serialize = function (buffer, start) {

        var object = this.object


        buffer[start++] = object.integer & 0xff
        buffer[start++] = object.integer >>> 8 & 0xff
        buffer[start++] = object.integer >>> 16 & 0xff
        buffer[start++] = object.integer >>> 24 & 0xff

        return { start: start, serializer: null }
    }

    return serializers
})()
