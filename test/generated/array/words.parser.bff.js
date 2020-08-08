module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $i = [], $I = []

                    let object = {
                        nudge: 0,
                        array: [],
                        sentry: 0
                    }

                    if ($end - $start < 3) {
                        return $incremental.object(object, 1, $i, $I)($buffer, $start, $end)
                    }

                    object.nudge = $buffer[$start++]

                    $I[0] =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    $i[0] = 0

                    if ($end - $start < 1 + 2 * $I[0]) {
                        return $incremental.object(object, 5, $i, $I)($buffer, $start, $end)
                    }

                    for (; $i[0] < $I[0]; $i[0]++) {
                        object.array[$i[0]] =
                            $buffer[$start++] << 8 |
                            $buffer[$start++]
                    }

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
