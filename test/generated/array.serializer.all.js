module.exports = function (serializers) {
    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            let $i = []

            for ($i[1] = 0; $i[1] < object.array.length; $i[1]++) {
                $buffer[$start++] = object.array[$i[1]] & 0xff
            }

            $buffer[$start++] = 0xd

            $i[1]++
            if ($i[1] < 32) {
                $buffer[$start++] = 0xa
                $i[1]++
            }

            return { start: $start, serialize: null }
        }
    }
}
