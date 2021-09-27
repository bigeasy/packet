module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $I = []

                    let object = {
                        nudge: 0,
                        first: [],
                        second: [],
                        sentry: 0
                    }

                    if ($end - $start < 3) {
                        return $incremental.object(object, 1, $I)($buffer, $start, $end)
                    }

                    object.nudge = $buffer[$start++]

                    $I[0] =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]

                    if ($end - $start < 2 + 1 * $I[0]) {
                        return $incremental.object(object, 5, $I)($buffer, $start, $end)
                    }

                    object.first = $buffer.slice($start, $start + $I[0])
                    $start += $I[0]

                    $I[0] =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]

                    if ($end - $start < 1 + 1 * $I[0]) {
                        return $incremental.object(object, 8, $I)($buffer, $start, $end)
                    }

                    object.second = $buffer.slice($start, $start + $I[0])
                    $start += $I[0]

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
