module.exports = function (serializers) {
    const $Buffer = Buffer

    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            if ($end - $start < 8) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0)
                }
            }

            $buffer.write("0faded", $start, $start + 3, 'hex')
            $start += 3

            $buffer[$start++] = (object.padded >>> 8 & 0xff)
            $buffer[$start++] = (object.padded & 0xff)

            $buffer.write("facade", $start, $start + 3, 'hex')
            $start += 3

            return { start: $start, serialize: null }
        }
    }
}
