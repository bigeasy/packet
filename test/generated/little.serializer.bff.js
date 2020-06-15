module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            if ($end - $start < 4) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0)
                }
            }

            $buffer[$start++] = object.word & 0xff
            $buffer[$start++] = object.word >>> 8 & 0xff
            $buffer[$start++] = object.word >>> 16 & 0xff
            $buffer[$start++] = object.word >>> 24 & 0xff

            return { start: $start, serialize: null }
        }
    }
}
