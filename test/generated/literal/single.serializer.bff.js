module.exports = function ({ serializers }) {
    serializers.bff.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                if ($end - $start < 9) {
                    return serializers.inc.object(object, 0)($buffer, $start, $end)
                }

                $buffer.write("0faded", $start, $start + 3, 'hex')
                $start += 3

                $buffer[$start++] = (object.padded >>> 8 & 0xff)
                $buffer[$start++] = (object.padded & 0xff)

                $buffer.write("facade", $start, $start + 3, 'hex')
                $start += 3

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
