module.exports = function (serializers) {
    const $Buffer = Buffer

    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            let $i = []

            $buffer[$start++] = (object.array.length >>> 8 & 0xff)
            $buffer[$start++] = (object.array.length & 0xff)

            for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                $buffer[$start++] = (object.array[$i[0]].first.length >>> 8 & 0xff)
                $buffer[$start++] = (object.array[$i[0]].first.length & 0xff)

                for ($i[1] = 0; $i[1] < object.array[$i[0]].first.length; $i[1]++) {
                    $buffer[$start++] = (object.array[$i[0]].first[$i[1]] >>> 8 & 0xff)
                    $buffer[$start++] = (object.array[$i[0]].first[$i[1]] & 0xff)
                }
            }

            return { start: $start, serialize: null }
        }
    }
}