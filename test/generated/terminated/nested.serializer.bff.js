module.exports = function ({ serializers }) {
    serializers.bff.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = []

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.nudge & 0xff)

                for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                    if ($end - $start < 2 + object.array[$i[0]].length * 2) {
                        return serializers.inc.object(object, 3, $i)($buffer, $start, $end)
                    }

                    for ($i[1] = 0; $i[1] < object.array[$i[0]].length; $i[1]++) {
                        $buffer[$start++] = (object.array[$i[0]][$i[1]] >>> 8 & 0xff)
                        $buffer[$start++] = (object.array[$i[0]][$i[1]] & 0xff)
                    }

                    $buffer[$start++] = 0x0
                    $buffer[$start++] = 0x0
                }

                if ($end - $start < 3) {
                    return serializers.inc.object(object, 9, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = 0x0
                $buffer[$start++] = 0x0

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
