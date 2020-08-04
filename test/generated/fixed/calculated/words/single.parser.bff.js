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

                    if ($end - $start < 1) {
                        return $incremental.object(object, 1, $i, $I)($buffer, $start, $end)
                    }

                    object.nudge = $buffer[$start++]

                    $I[0] = (() => 8)()

                    if ($end - $start < $I[0] * 1) {
                        return $incremental.object(object, 3, $i, $I)($buffer, $start, $end)
                    }

                    $i[0] = 0
                    do {
                        if ($end - $start < 1) {
                            return $incremental.object(object, 4, $i, $I)($buffer, $start, $end)
                        }

                        if (
                            $buffer[$start] == 0x0
                        ) {
                            $start += 1
                            break
                        }

                        if ($end - $start < 1) {
                            return $incremental.object(object, 6, $i, $I)($buffer, $start, $end)
                        }

                        object.array[$i[0]] = $buffer[$start++]
                    } while (++$i[0] != $I[0])

                    $start += $I[0] != $i[0]
                            ? ($I[0] - $i[0]) * 1 - 1
                            : 0

                    if ($end - $start < 1) {
                        return $incremental.object(object, 10, $i, $I)($buffer, $start, $end)
                    }

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
