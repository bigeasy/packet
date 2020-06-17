module.exports = function (serializers) {
    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            $buffer[$start++] = Number(object.word >> 56n & 0xffn)
            $buffer[$start++] = Number(object.word >> 48n & 0xffn)
            $buffer[$start++] = Number(object.word >> 40n & 0xffn)
            $buffer[$start++] = Number(object.word >> 32n & 0xffn)
            $buffer[$start++] = Number(object.word >> 24n & 0xffn)
            $buffer[$start++] = Number(object.word >> 16n & 0xffn)
            $buffer[$start++] = Number(object.word >> 8n & 0xffn)
            $buffer[$start++] = Number(object.word & 0xffn)

            return { start: $start, serialize: null }
        }
    }
}
