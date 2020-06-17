module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            if ($end - $start < 8) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0)
                }
            }

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
