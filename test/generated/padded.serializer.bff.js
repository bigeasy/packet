module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            let $i = []

            if ($end - $start < 16) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0)
                }
            }

            for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                $buffer[$start++] = object.array[$i[0]] & 0xff
            }

            for (;;) {
                if ($i[0] == 16) {
                    break
                }
                $buffer[$start++] = 0xd
                $i[0]++

                if ($i[0] == 16) {
                    break
                }
                $buffer[$start++] = 0xa
                $i[0]++
            }

            return { start: $start, serialize: null }
        }
    }
}
