module.exports = function ({ serializers, $lookup }) {
    serializers.chk.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $_

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 0)($buffer, $start, $end)
                }

                $buffer[$start++] = object.nudge & 0xff

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 2)($buffer, $start, $end)
                }

                $_ = $lookup[0].indexOf(object.value)

                $buffer[$start++] = $_ & 0xff

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 4)($buffer, $start, $end)
                }

                $_ = $lookup[1].indexOf(object.yn)

                $buffer[$start++] = $_ & 0xff

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 6)($buffer, $start, $end)
                }

                $_ = $lookup[0].indexOf(object.binary)

                $buffer[$start++] = $_ & 0xff

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 8)($buffer, $start, $end)
                }

                $_ = $lookup[2].reverse[object.mapped]

                $buffer[$start++] = $_ & 0xff

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 10)($buffer, $start, $end)
                }

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        }
    } ()
}
