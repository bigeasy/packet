module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $i = [], $I = []

                let object = {
                    nudge: 0,
                    array: [],
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1, $i, $I)($buffer, $start, $end)
                }

                object.nudge = (
                    $buffer[$start++]
                ) >>> 0

                if ($end - $start < 2) {
                    return parsers.inc.object(object, 3, $i, $I)($buffer, $start, $end)
                }

                $I[0] = (
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0
                $i[0] = 0

                for (; $i[0] < $I[0]; $i[0]++) {
                    object.array[$i[0]] = []

                    if ($end - $start < 2) {
                        return parsers.inc.object(object, 6, $i, $I)($buffer, $start, $end)
                    }

                    $I[1] = (
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0
                    $i[1] = 0

                    if ($end - $start < 2 * $I[1]) {
                        return parsers.inc.object(object, 8, $i, $I)($buffer, $start, $end)
                    }

                    for (; $i[1] < $I[1]; $i[1]++) {
                        object.array[$i[0]][$i[1]] = (
                            $buffer[$start++] << 8 |
                            $buffer[$start++]
                        ) >>> 0
                    }
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 11, $i, $I)($buffer, $start, $end)
                }

                object.sentry = (
                    $buffer[$start++]
                ) >>> 0

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
