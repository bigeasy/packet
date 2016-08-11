module.exports = (function () {
    var serializers = {}

    serializers.object = function (object) {
        this.object = object
    }

    serializers.object.prototype.serialize = function (buffer, start) {

        var object = this.object


        buffer[start++] = object.word >>> 8 & 0xff
        buffer[start++] = object.word & 0xff

        return { start: start, serializer: null }
    }

    return serializers
})()
