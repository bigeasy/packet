module.exports = function (serializers) {
    const $Buffer = Buffer

    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            $buffer[$start++] = (object.word >>> 8 & 0xff)
            $buffer[$start++] = (object.word & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
