module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            let $i = []

            if ($end - $start < 3) {
                return serializers.inc.object(object, 0)($buffer, $start, $end)
            }

            $i[0] = (value => value)(object.value)

            $buffer[$start++] = ($i[0] >>> 8 & 0xff)
            $buffer[$start++] = ($i[0] & 0xff)

            $buffer[$start++] = (object.sentry & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
