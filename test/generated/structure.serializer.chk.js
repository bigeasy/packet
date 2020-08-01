module.exports = function ({ serializers, $lookup }) {
    serializers.chk.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                if ($end - $start < 1) {
                    return serializers.inc.object(object, 0)($buffer, $start, $end)
                }

                $buffer[$start++] = object.value.first & 0xff

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 2)($buffer, $start, $end)
                }

                $buffer[$start++] = object.value.second & 0xff

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 4)($buffer, $start, $end)
                }

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        }
    } ()
}
