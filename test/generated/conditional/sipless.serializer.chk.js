module.exports = function ({ serializers }) {
    serializers.chk.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                if ($end - $start < 1) {
                    return serializers.inc.object(object, 0)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.type & 0xff)

                if (((_, $) => $.type == 0)(object.value, object)) {
                    if ($end - $start < 2) {
                        return serializers.inc.object(object, 3)($buffer, $start, $end)
                    }

                    $buffer[$start++] = (object.value >>> 8 & 0xff)
                    $buffer[$start++] = (object.value & 0xff)
                } else if (((_, $) => $.type == 1)(object.value, object)) {
                    if ($end - $start < 3) {
                        return serializers.inc.object(object, 5)($buffer, $start, $end)
                    }

                    $buffer[$start++] = (object.value >>> 16 & 0xff)
                    $buffer[$start++] = (object.value >>> 8 & 0xff)
                    $buffer[$start++] = (object.value & 0xff)
                } else {
                    if ($end - $start < 4) {
                        return serializers.inc.object(object, 7)($buffer, $start, $end)
                    }

                    $buffer[$start++] = (object.value >>> 24 & 0xff)
                    $buffer[$start++] = (object.value >>> 16 & 0xff)
                    $buffer[$start++] = (object.value >>> 8 & 0xff)
                    $buffer[$start++] = (object.value & 0xff)
                }

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 9)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
