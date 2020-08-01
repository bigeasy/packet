module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $i = [], $I = []

                let object = {
                    nudge: 0,
                    array: [],
                    sentry: 0
                }

                if ($end - $start < 3) {
                    return parsers.inc.object(object, 1, $i, $I)($buffer, $start, $end)
                }

                object.nudge = $buffer[$start++]

                $I[0] =
                    $buffer[$start++] * 0x100 +
                    $buffer[$start++]
                $i[0] = 0

                for (; $i[0] < $I[0]; $i[0]++) {
                    object.array[$i[0]] = {
                        first: []
                    }

                    if ($end - $start < 2) {
                        return parsers.inc.object(object, 6, $i, $I)($buffer, $start, $end)
                    }

                    $I[1] =
                        $buffer[$start++] * 0x100 +
                        $buffer[$start++]
                    $i[1] = 0

                    if ($end - $start < 2 * $I[1]) {
                        return parsers.inc.object(object, 8, $i, $I)($buffer, $start, $end)
                    }

                    for (; $i[1] < $I[1]; $i[1]++) {
                        object.array[$i[0]].first[$i[1]] =
                            $buffer[$start++] * 0x100 +
                            $buffer[$start++]
                    }
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 11, $i, $I)($buffer, $start, $end)
                }

                object.sentry = $buffer[$start++]

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
