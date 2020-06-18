module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            if ($end - $start < 8) {
                return serializers.inc.object(object, 0)($buffer, $start, $end)
            }

            $buffer[$start++] = Number(object.value >> 56n & 0xffn)
            $buffer[$start++] = Number(object.value >> 48n & 0xffn)
            $buffer[$start++] = Number(object.value >> 40n & 0xffn)
            $buffer[$start++] = Number(object.value >> 32n & 0xffn)
            $buffer[$start++] = Number(object.value >> 24n & 0xffn)
            $buffer[$start++] = Number(object.value >> 16n & 0xffn)
            $buffer[$start++] = Number(object.value >> 8n & 0xffn)
            $buffer[$start++] = Number(object.value & 0xffn)

            return { start: $start, serialize: null }
        }
    }
}
