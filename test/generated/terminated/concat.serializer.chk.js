module.exports = function ({ serializers }) {
    serializers.chk.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = []

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.nudge & 0xff)

                for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                    if ($end - $start < 1) {
                        return serializers.inc.object(object, 3, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = (object.array[$i[0]] & 0xff)
                }

                if ($end - $start < 2) {
                    return serializers.inc.object(object, 5, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = 0xd
                $buffer[$start++] = 0xa

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 8, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
