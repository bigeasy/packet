module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            $buffer[$start++] = object.nudge & 0xff

            if ((value => value <= 0x7f)(object.value)) {
                $buffer[$start++] = object.value & 0xff
            } else if ((value => value <= 0x3fff)(object.value)) {
                $buffer[$start++] = object.value >>> 7 & 0x7f | 0x80
                $buffer[$start++] = object.value & 0x7f
            } else if ((value => value <= 0x1fffff)(object.value)) {
                $buffer[$start++] = object.value >>> 14 & 0x7f | 0x80
                $buffer[$start++] = object.value >>> 7 & 0x7f | 0x80
                $buffer[$start++] = object.value & 0x7f
            } else {
                $buffer[$start++] = object.value >>> 21 & 0x7f | 0x80
                $buffer[$start++] = object.value >>> 14 & 0x7f | 0x80
                $buffer[$start++] = object.value >>> 7 & 0x7f | 0x80
                $buffer[$start++] = object.value & 0x7f
            }

            $buffer[$start++] = object.sentry & 0xff

            return { start: $start, serialize: null }
        }
    } ()
}
