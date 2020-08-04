module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $i = []

                    let object = {
                        nudge: 0,
                        array: [],
                        sentry: 0
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 1, $i)($buffer, $start, $end)
                    }

                    object.nudge = $buffer[$start++]

                    if ($end - $start < 8) {
                        return $incremental.object(object, 3, $i)($buffer, $start, $end)
                    }

                    $i[0] = 0
                    do {
                        object.array[$i[0]] = (
                            $buffer[$start++] << 8 |
                            $buffer[$start++]
                        ) >>> 0
                    } while (++$i[0] != 4)

                    if ($end - $start < 1) {
                        return $incremental.object(object, 7, $i)($buffer, $start, $end)
                    }

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
