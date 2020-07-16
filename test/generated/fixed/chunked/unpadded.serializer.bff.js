module.exports = function ({ serializers }) {
    serializers.bff.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $_, $i = []

                if ($end - $start < 10) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.nudge & 0xff)

                $_ = 0
                for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                    object.array[$i[0]].copy($buffer, $start)
                    $start += object.array[$i[0]].length
                    $_ += object.array[$i[0]].length
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
