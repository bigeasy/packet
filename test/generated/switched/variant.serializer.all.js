module.exports = function (serializers) {
    const $Buffer = Buffer

    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            $buffer[$start++] = (object.type & 0xff)

            switch (($ => $.type)(object)) {
            case 0:

                $buffer[$start++] = (object.value & 0xff)

                break

            case 1:

                $buffer[$start++] = (object.value >>> 8 & 0xff)
                $buffer[$start++] = (object.value & 0xff)

                break

            default:

                $buffer[$start++] = (object.value >>> 16 & 0xff)
                $buffer[$start++] = (object.value >>> 8 & 0xff)
                $buffer[$start++] = (object.value & 0xff)

                break
            }

            return { start: $start, serialize: null }
        }
    }
}
