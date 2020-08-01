module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            if ((value => value < 251)(object.value)) {
                $buffer[$start++] = object.value & 0xff
            } else if ((value => value >= 251 && value < 2 ** 16)(object.value)) {
                $buffer.write('fc', $start, $start + 1, 'hex')
                $start += 1

                $buffer[$start++] = object.value >>> 8 & 0xff
                $buffer[$start++] = object.value & 0xff
            } else {
                $buffer.write('fd', $start, $start + 1, 'hex')
                $start += 1

                $buffer[$start++] = object.value >>> 16 & 0xff
                $buffer[$start++] = object.value >>> 8 & 0xff
                $buffer[$start++] = object.value & 0xff
            }

            $buffer[$start++] = object.sentry & 0xff

            return { start: $start, serialize: null }
        }
    } ()
}
