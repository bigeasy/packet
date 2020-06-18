module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            let $i = []

            for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                if ($end - $start < 2 + 2 * object.array[$i[0]].length) {
                    return serializers.inc.object(object, 1, $i)($buffer, $start, $end)
                }

                for ($i[1] = 0; $i[1] < object.array[$i[0]].length; $i[1]++) {
                    $buffer[$start++] = (object.array[$i[0]][$i[1]] >>> 8 & 0xff)
                    $buffer[$start++] = (object.array[$i[0]][$i[1]] & 0xff)
                }

                $buffer[$start++] = 0x0
                $buffer[$start++] = 0x0
            }

            if ($end - $start < 2) {
                return serializers.inc.object(object, 6, $i)($buffer, $start, $end)
            }

            $buffer[$start++] = 0x0
            $buffer[$start++] = 0x0

            return { start: $start, serialize: null }
        }
    }
}
