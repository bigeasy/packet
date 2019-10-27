module.exports = function (serializers) {
    serializers.all.object = function (object) {
        this.object = object
    }

    serializers.all.object.prototype.serialize = function (buffer, start) {

        var object = this.object

        var I
        var i
        var object

        object = new Buffer(object.string, "utf8")
        for (var i = 0, I = object.length; i < I; i++) {
            buffer[start++] = object[i]
        }
        object = [0]
        for (var i = 0, I = object.length; i < I; i++) {
            buffer[start++] = object[i]
        }

        return { start: start, serializer: null }
    }
}
