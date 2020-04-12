module.exports = function (serializers) {
    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            if ((undefined)(object.value, object)) {
                $buffer[$start++] = object.value & 0xff
            } else if ((undefined)(object.value, object)) {
                $buffer.write("fc", $start, $start + 1, 'hex')
                $start += 1

                $buffer[$start++] = object.value >>> 8 & 0xff
                $buffer[$start++] = object.value & 0xff
            }

            return { start: $start, serialize: null }
        }
    }
}
