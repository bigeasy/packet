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

                    $buffer[$start++] = object.value >>> 7 & 0x7f | 0x80
                    $buffer[$start++] = object.value & 0x7f

                    if ($end - $start < 1) {
                        return $incremental.object(object, 5)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
