module.exports = function (serializers) {
    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            $buffer[$start++] = (object.value >>> 8 & 0xff)
            $buffer[$start++] = (object.value & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
