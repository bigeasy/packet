module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            if ($end - $start < 1) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0)
                }
            }

            $buffer[$start++] = object.type & 0xff

            if (((_, $) => $.type == 0)(object.value, object)) {
                if ($end - $start < 2) {
                    return {
                        start: $start,
                        serialize: serializers.inc.object(object, 3)
                    }
                }

                $buffer[$start++] = object.value >>> 8 & 0xff
                $buffer[$start++] = object.value & 0xff
            } else if (((_, $) => $.type == 1)(object.value, object)) {
                if ($end - $start < 3) {
                    return {
                        start: $start,
                        serialize: serializers.inc.object(object, 5)
                    }
                }

                $buffer[$start++] = object.value >>> 16 & 0xff
                $buffer[$start++] = object.value >>> 8 & 0xff
                $buffer[$start++] = object.value & 0xff
            } else {
                if ($end - $start < 4) {
                    return {
                        start: $start,
                        serialize: serializers.inc.object(object, 7)
                    }
                }

                $buffer[$start++] = object.value >>> 24 & 0xff
                $buffer[$start++] = object.value >>> 16 & 0xff
                $buffer[$start++] = object.value >>> 8 & 0xff
                $buffer[$start++] = object.value & 0xff
            }

            return { start: $start, serialize: null }
        }
    }
}
