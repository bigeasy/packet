module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $i = []

                    if ($end - $start < 1) {
                        return $incremental.object(object, 0, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    if ($end - $start < 1 + object.array.length) {
                        return $incremental.object(object, 2, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.array.length & 0xff

                    object.array.copy($buffer, $start, 0, object.array.length)
                    $start += object.array.length

                    if ($end - $start < 1) {
                        return $incremental.object(object, 5, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
