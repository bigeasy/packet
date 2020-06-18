module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            if ((value => value < 251)(object.value, object)) {
                if ($end - $start < 1) {
                    return serializers.inc.object(object, 1)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.value & 0xff)
            } else if ((value => value >= 251 && value < 2 ** 16)(object.value, object)) {
                if ($end - $start < 3) {
                    return serializers.inc.object(object, 3)($buffer, $start, $end)
                }

                $buffer.write("fc", $start, $start + 1, 'hex')
                $start += 1

                $buffer[$start++] = (object.value >>> 8 & 0xff)
                $buffer[$start++] = (object.value & 0xff)

            } else {
                if ($end - $start < 4) {
                    return serializers.inc.object(object, 7)($buffer, $start, $end)
                }

                $buffer.write("fd", $start, $start + 1, 'hex')
                $start += 1

                $buffer[$start++] = (object.value >>> 16 & 0xff)
                $buffer[$start++] = (object.value >>> 8 & 0xff)
                $buffer[$start++] = (object.value & 0xff)

            }

            return { start: $start, serialize: null }
        }
    }
}
