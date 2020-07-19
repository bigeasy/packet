module.exports = function ({ serializers, $lookup }) {
    serializers.chk.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = [], $I = []

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.nudge & 0xff)

                $I[0] = (() => 4)()

                if ($end - $start < $I[0] * 2) {
                    return serializers.inc.object(object, 2, $i)($buffer, $start, $end)
                }

                for ($i[0] = 0; $i[0] < $I[0]; $i[0]++) {
                    if ($end - $start < 2) {
                        return serializers.inc.object(object, 3, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = (object.array[$i[0]] >>> 8 & 0xff)
                    $buffer[$start++] = (object.array[$i[0]] & 0xff)
                }

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 5, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
