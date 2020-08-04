module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    if ($end - $start < 4) {
                        return $incremental.object(object, 0)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    $buffer[$start++] = object.value >>> 7 & 0x7f
                    $buffer[$start++] = object.value & 0x7f

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
