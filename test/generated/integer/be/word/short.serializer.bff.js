module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            if ($end - $start < 2) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0)
                }
            }

            $buffer[$start++] = (object.value >>> 8 & 0xff)
            $buffer[$start++] = (object.value & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
