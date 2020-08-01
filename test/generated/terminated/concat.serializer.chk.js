module.exports = function ({ serializers, $lookup }) {
    serializers.chk.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = []

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = object.nudge & 0xff

                if ($end - $start < 2 + object.array.length) {
                    return serializers.inc.object(object, 2, $i)($buffer, $start, $end)
                }

                object.array.copy($buffer, $start, 0, object.array.length)
                $start += object.array.length

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
