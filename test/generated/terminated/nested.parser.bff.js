module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $i = []

                let object = {
                    nudge: 0,
                    array: [],
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1, $i)($buffer, $start, $end)
                }

                object.nudge = $buffer[$start++]

                $i[0] = 0
                for (;;) {
                    if ($end - $start < 2) {
                        return parsers.inc.object(object, 4, $i)($buffer, $start, $end)
                    }

                    if (
                        $buffer[$start] == 0x0 &&
                        $buffer[$start + 1] == 0x0
                    ) {
                        $start += 2
                        break
                    }

                    object.array[$i[0]] = []

                    $i[1] = 0
                    for (;;) {
                        if ($end - $start < 2) {
                            return parsers.inc.object(object, 8, $i)($buffer, $start, $end)
                        }

                        if (
                            $buffer[$start] == 0x0 &&
                            $buffer[$start + 1] == 0x0
                        ) {
                            $start += 2
                            break
                        }

                        if ($end - $start < 2) {
                            return parsers.inc.object(object, 11, $i)($buffer, $start, $end)
                        }

                        object.array[$i[0]][$i[1]] =
                            $buffer[$start++] * 0x100 +
                            $buffer[$start++]

                        $i[1]++
                    }

                    $i[0]++
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 16, $i)($buffer, $start, $end)
                }

                object.sentry = $buffer[$start++]

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
