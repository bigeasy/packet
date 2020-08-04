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

                    if ($end - $start < 10) {
                        return $incremental.object(object, 1, $i)($buffer, $start, $end)
                    }

                    object.nudge = $buffer[$start++]

                    $i[0] = 0
                    do {
                        if ($end - $start < 1) {
                            return $incremental.object(object, 4, $i)($buffer, $start, $end)
                        }

                        if (
                            $buffer[$start] == 0x0
                        ) {
                            $start += 1
                            break
                        }

                        object.array[$i[0]] = $buffer[$start++]
                    } while (++$i[0] != 8)

                    $start += 8 != $i[0]
                            ? (8 - $i[0]) * 1 - 1
                            : 0

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
