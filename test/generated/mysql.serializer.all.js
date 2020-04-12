module.exports = function (serializers) {
    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            if ((value => value < 251)(object.value, object)) {
                $buffer[$start++] = object.value & 0xff
            } else if ((value => value >= 251)(object.value, object)) {
                $buffer.write("fc", $start, $start + 1, 'hex')
                $start += 1

                $buffer[$start++] = object.value >>> 8 & 0xff
                $buffer[$start++] = object.value & 0xff
            }

            return { start: $start, serialize: null }
        }
    }
}
