module.exports = function ({ serializers, $lookup }) {
    serializers.bff.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                if ($end - $start < 1) {
                    return serializers.inc.object(object, 0)($buffer, $start, $end)
                }

                $buffer[$start++] = object.nudge & 0xff

                if ((value => value <= 0x7f)(object.value)) {
                    if ($end - $start < 1) {
                        return serializers.inc.object(object, 3)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.value & 0xff
                } else if ((value => value <= 0x3fff)(object.value)) {
                    if ($end - $start < 2) {
                        return serializers.inc.object(object, 5)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.value >>> 7 & 0x7f | 0x80
                    $buffer[$start++] = object.value & 0x7f
                } else if ((value => value <= 0x1fffff)(object.value)) {
                    if ($end - $start < 3) {
                        return serializers.inc.object(object, 8)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.value >>> 14 & 0x7f | 0x80
                    $buffer[$start++] = object.value >>> 7 & 0x7f | 0x80
                    $buffer[$start++] = object.value & 0x7f
                } else {
                    if ($end - $start < 4) {
                        return serializers.inc.object(object, 12)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.value >>> 21 & 0x7f | 0x80
                    $buffer[$start++] = object.value >>> 14 & 0x7f | 0x80
                    $buffer[$start++] = object.value >>> 7 & 0x7f | 0x80
                    $buffer[$start++] = object.value & 0x7f
                }

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 17)($buffer, $start, $end)
                }

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        }
    } ()
}
