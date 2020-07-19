module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            let $i = []

            $buffer[$start++] = (object.nudge & 0xff)

            for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                $buffer[$start++] = (object.array[$i[0]] & 0xff)
            }

            for (;;) {
                if ($i[0] == 8) {
                    break
                }
                $buffer[$start++] = 0x0
                $i[0]++
            }

            $buffer[$start++] = (object.sentry & 0xff)

            return { start: $start, serialize: null }
        }
    } ()
}
