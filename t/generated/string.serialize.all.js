module.exports = function (serializers) {
    serializers.all.object = function (object) {
        this.object = object
    }

    serializers.all.object.prototype.serialize = function (buffer, start) {

        var object = this.object

        var value

        value = new Buffer(object.string, "utf8")
        for (var i = 0, I = value.length; i < I; i++) {
            buffer[start++] = value[i]
        }
        value = [0]
        for (var i = 0, I = value.length; i < I; i++) {
            buffer[start++] = value[i]
        }

        return { start: start, serializer: null }
    }
}
