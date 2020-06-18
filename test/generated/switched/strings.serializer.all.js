module.exports = function (serializers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            $buffer[$start++] = (object.type & 0xff)

            switch (String(($ => $.type)(object))) {
            case "0":

                $buffer[$start++] = (object.value & 0xff)

                break

            case "1":

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
