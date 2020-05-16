module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            let $i = []

            for ($i[1] = 0; $i[1] < object.array.length; $i[1]++) {
                for ($i[3] = 0; $i[3] < object.array[$i[1]].length; $i[3]++) {
                    $buffer[$start++] = object.array[$i[1]][$i[3]] >>> 8 & 0xff
                    $buffer[$start++] = object.array[$i[1]][$i[3]] & 0xff
                }

                $buffer[$start++] = 0x0
                $buffer[$start++] = 0x0
            }

            $buffer[$start++] = 0x0
            $buffer[$start++] = 0x0

            return { start: $start, serialize: null }
        }
    }
}
