module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        this.object = object
    }

    serializers.bff.object.prototype.serialize = function (buffer, start, end) {

        var object = this.object

        var serializer

        if (end - start < 2) {
            serializer = new serializers.inc.object
            serializer.step = 0
            serializer.stack = [{
                object: object
            }]
            return { start: start, serializer: serializer }
        }

        buffer[start++] = object.integer >>> 8 & 0xff
        buffer[start++] = object.integer & 0xff

        return { start: start, serializer: null }
    }
}
