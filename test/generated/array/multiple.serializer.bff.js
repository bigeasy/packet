module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    if ($end - $start < 6 + object.first.length * 1 + object.second.length * 1) {
                        return $incremental.object(object, 0)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    $buffer[$start++] = object.first.length >>> 8 & 0xff
                    $buffer[$start++] = object.first.length & 0xff

                    object.first.copy($buffer, $start, 0, object.first.length)
                    $start += object.first.length

                    $buffer[$start++] = object.second.length >>> 8 & 0xff
                    $buffer[$start++] = object.second.length & 0xff

                    object.second.copy($buffer, $start, 0, object.second.length)
                    $start += object.second.length

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
