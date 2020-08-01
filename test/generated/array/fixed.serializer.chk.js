module.exports = function ({ serializers, $lookup }) {
    serializers.chk.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = []

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = object.nudge & 0xff

                if ($end - $start < 2) {
                    return serializers.inc.object(object, 2, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = object.array.length >>> 8 & 0xff
                $buffer[$start++] = object.array.length & 0xff

                for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                    if ($end - $start < 2) {
                        return serializers.inc.object(object, 4, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.array[$i[0]].first >>> 8 & 0xff
                    $buffer[$start++] = object.array[$i[0]].first & 0xff

                    if ($end - $start < 2) {
                        return serializers.inc.object(object, 6, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.array[$i[0]].second >>> 8 & 0xff
                    $buffer[$start++] = object.array[$i[0]].second & 0xff
                }

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 8, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        }
    } ()
}
