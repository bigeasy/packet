module.exports = function ({ serializers, $lookup }) {
    serializers.chk.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $_, $i = []

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = object.nudge & 0xff

                if ($end - $start < 2 + object.array.reduce((sum, buffer) => sum + buffer.length, 0)) {
                    return serializers.inc.object(object, 2, $i)($buffer, $start, $end)
                }

                $_ = 0
                for (let $index = 0; $index < object.array.length; $index++) {
                    object.array[$index].copy($buffer, $start)
                    $start += object.array[$index].length
                    $_ += object.array[$index].length
                }

                $buffer[$start++] = 0xd
                $buffer[$start++] = 0xa

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 6, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        }
    } ()
}
