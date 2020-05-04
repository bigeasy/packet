module.exports = function (serializers) {
    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            let $i = []

            for ($i[1] = 0; $i[1] < object.array.length; $i[1]++) {
                $buffer[$start++] = object.array[$i[1]] >>> 8 & 0xff
                $buffer[$start++] = object.array[$i[1]] & 0xff
            }

            $buffer[$start++] = 0x0
            $buffer[$start++] = 0x0

            return { start: $start, serialize: null }
        }
    }
}