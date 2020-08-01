module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            $buffer[$start++] = object.value >>> 8 & 0xff
            $buffer[$start++] = object.value & 0xff

            $buffer[$start++] = object.sentry & 0xff

            return { start: $start, serialize: null }
        }
    } ()
}
