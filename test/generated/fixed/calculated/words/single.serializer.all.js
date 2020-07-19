module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = [], $I = []

                $buffer[$start++] = (object.nudge & 0xff)

                $I[0] = (() => 8)()

                for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                    $buffer[$start++] = (object.array[$i[0]] & 0xff)
                }

                for (;;) {
                    if ($i[0] == $I[0]) {
                        break
                    }
                    $buffer[$start++] = 0x0
                    $i[0]++
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
