module.exports = function ({ serializers }) {
    serializers.chk.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                if ($end - $start < 2) {
                    return serializers.inc.object(object, 0)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.value >>> 8 & 0xff)
                $buffer[$start++] = (object.value & 0xff)

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 2)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
