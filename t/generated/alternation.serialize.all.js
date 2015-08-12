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

        var select

        select = object.number

        if (128 <= select) {

            buffer[start++] = object.number >>> 8 & 0xff
            buffer[start++] = object.number & 0xff

        } else {

            buffer[start++] = object.number & 0xff

        }

        engine.start = start

        return object
    }

    return serializers
})()
