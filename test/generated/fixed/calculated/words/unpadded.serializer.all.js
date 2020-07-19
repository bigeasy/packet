module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            let $i = [], $I = []

            $buffer[$start++] = (object.nudge & 0xff)

            $I[0] = (() => 4)()

            for ($i[0] = 0; $i[0] < $I[0]; $i[0]++) {
                $buffer[$start++] = (object.array[$i[0]] >>> 8 & 0xff)
                $buffer[$start++] = (object.array[$i[0]] & 0xff)
            }

            $buffer[$start++] = (object.sentry & 0xff)

            return { start: $start, serialize: null }
        }
    } ()
}
