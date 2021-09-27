module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    if ($end - $start < 1) {
                        return $incremental.object(object, 0)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    if ($end - $start < 2) {
                        return $incremental.object(object, 2)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.first.length >>> 8 & 0xff
                    $buffer[$start++] = object.first.length & 0xff

                    if ($end - $start < 0 + object.first.length) {
                        return $incremental.object(object, 4)($buffer, $start, $end)
                    }

                    object.first.copy($buffer, $start, 0, object.first.length)
                    $start += object.first.length

                    if ($end - $start < 2) {
                        return $incremental.object(object, 5)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.second.length >>> 8 & 0xff
                    $buffer[$start++] = object.second.length & 0xff

                    if ($end - $start < 0 + object.second.length) {
                        return $incremental.object(object, 7)($buffer, $start, $end)
                    }

                    object.second.copy($buffer, $start, 0, object.second.length)
                    $start += object.second.length

                    if ($end - $start < 1) {
                        return $incremental.object(object, 8)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
