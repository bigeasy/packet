module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $_, $i = []

                    if ($end - $start < 1) {
                        return $incremental.object(object, 0, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    if ($end - $start < 8) {
                        return $incremental.object(object, 2, $i)($buffer, $start, $end)
                    }

                    $_ = 0
                    object.array.copy($buffer, $start)
                    $start += object.array.length
                    $_ += object.array.length

                    if ($end - $start < 1) {
                        return $incremental.object(object, 4, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
