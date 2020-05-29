module.exports = function (serializers) {
    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            let $i = []

            for ($i[0] = 0; $i[0] < 2; $i[0]++) {
                $buffer.write("0faded", $start, $start + 3, 'hex')
                $start += 3
            }

            $buffer[$start++] = object.padded >>> 8 & 0xff
            $buffer[$start++] = object.padded & 0xff

            for ($i[0] = 0; $i[0] < 2; $i[0]++) {
                $buffer.write("facade", $start, $start + 3, 'hex')
                $start += 3
            }

            return { start: $start, serialize: null }
        }
    }
}
