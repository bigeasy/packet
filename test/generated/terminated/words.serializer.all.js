module.exports = function ({ serializers }) {
    serializers.all.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = []

                $buffer[$start++] = (object.nudge & 0xff)

                for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                    $buffer[$start++] = (object.array[$i[0]] >>> 8 & 0xff)
                    $buffer[$start++] = (object.array[$i[0]] & 0xff)
                }

                $buffer[$start++] = 0x0
                $buffer[$start++] = 0x0

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
