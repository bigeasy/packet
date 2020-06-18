module.exports = function (serializers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            let $i = []

            if ($end - $start < 2 + 2 * object.array.length) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0)
                }
            }

            for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                $buffer[$start++] = (object.array[$i[0]] >>> 8 & 0xff)
                $buffer[$start++] = (object.array[$i[0]] & 0xff)
            }

            $buffer[$start++] = 0x0
            $buffer[$start++] = 0x0

            return { start: $start, serialize: null }
        }
    }
}
