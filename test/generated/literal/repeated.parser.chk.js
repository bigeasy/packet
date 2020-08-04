module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let object = {
                        nudge: 0,
                        padded: 0,
                        sentry: 0
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 1)($buffer, $start, $end)
                    }

                    object.nudge = $buffer[$start++]

                    if ($end - $start < 14) {
                        return $incremental.object(object, 3)($buffer, $start, $end)
                    }

                    $start += 6

                    object.padded = (
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0

                    $start += 6

                    if ($end - $start < 1) {
                        return $incremental.object(object, 9)($buffer, $start, $end)
                    }

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
