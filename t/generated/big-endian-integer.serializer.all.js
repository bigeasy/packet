module.exports = (function () {
    var serializers = {}

    serializers.object = function (object) {
        this.object = object
    }

    serializers.object.prototype.serialize = function (engine) {
        var buffer = engine.buffer
        var start = engine.start
        var end = engine.end

        var object = this.object


        buffer[start++] = object.integer >>> 24 & 0xff
        buffer[start++] = object.integer >>> 16 & 0xff
        buffer[start++] = object.integer >>> 8 & 0xff
        buffer[start++] = object.integer & 0xff

        engine.start = start

        return object
    }

    return serializers
})()
