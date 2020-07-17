module.exports = function ({ serializers, $lookup }) {
    serializers.bff.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = []

                if ($end - $start < 15) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                for ($i[0] = 0; $i[0] < 2; $i[0]++) {
                    $buffer.write("0faded", $start, $start + 3, 'hex')
                    $start += 3
                }

                $buffer[$start++] = (object.padded >>> 8 & 0xff)
                $buffer[$start++] = (object.padded & 0xff)

                for ($i[0] = 0; $i[0] < 2; $i[0]++) {
                    $buffer.write("facade", $start, $start + 3, 'hex')
                    $start += 3
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
