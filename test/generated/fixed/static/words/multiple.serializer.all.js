module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            let $i = []

            $buffer[$start++] = object.nudge & 0xff

            for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                $buffer[$start++] = object.array[$i[0]] & 0xff
            }

            for (;;) {
                if ($i[0] == 16) {
                    break
                }
                $buffer[$start++] = 0xd
                $i[0]++

                if ($i[0] == 16) {
                    break
                }
                $buffer[$start++] = 0xa
                $i[0]++
            }

            $buffer[$start++] = object.sentry & 0xff

            return { start: $start, serialize: null }
        }
    } ()
}
