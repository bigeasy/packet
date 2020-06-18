module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            if ($end - $start < 2) {
                return serializers.inc.object(object, 0)($buffer, $start, $end)
            }

            $buffer[$start++] = (object.value.first & 0xff)

            $buffer[$start++] = (object.value.second & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
