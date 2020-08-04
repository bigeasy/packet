module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $_, $i = [], $I = [], $slice = null

                    let object = {
                        nudge: 0,
                        array: null,
                        sentry: 0
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 1, $i, $I)($buffer, $start, $end)
                    }

                    object.nudge = $buffer[$start++]

                    $I[0] = (() => 8)()

                    if ($end - $start < $I[0] * 1) {
                        return $incremental.object(object, 3, $i, $I)($buffer, $start, $end)
                    }

                    $slice = $buffer.slice($start, $start + $I[0])
                    $start += $I[0]
                    object.array = [ $slice ]

                    if ($end - $start < 1) {
                        return $incremental.object(object, 5, $i, $I)($buffer, $start, $end)
                    }

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
