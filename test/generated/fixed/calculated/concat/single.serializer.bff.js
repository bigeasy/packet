module.exports = function ({ serializers, $lookup }) {
    serializers.bff.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $_, $i = [], $I = []

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = object.nudge & 0xff

                $I[0] = (() => 8)()

                if ($end - $start < $I[0] * 1) {
                    return serializers.inc.object(object, 2, $i)($buffer, $start, $end)
                }

                $_ = 0
                object.array.copy($buffer, $start)
                $start += object.array.length
                $_ += object.array.length

                $_ = $I[0] - $_
                $buffer.fill(0x0, $start, $start + $_)
                $start += $_

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 6, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        }
    } ()
}
