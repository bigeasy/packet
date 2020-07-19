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

                object.nudge = ($buffer[$start++])

                $i[0] = 0
                do {
                    object.array[$i[0]] = []

                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 5, $i, $I)($buffer, $start, $end)
                    }

                    $I[0] = ($buffer[$start++])
                    $i[1] = 0

                    if ($end - $start < 1 * $I[0]) {
                        return parsers.inc.object(object, 7, $i, $I)($buffer, $start, $end)
                    }

                    for (; $i[1] < $I[0]; $i[1]++) {
                        object.array[$i[0]][$i[1]] = ($buffer[$start++])
                    }
                } while (++$i[0] != 2)

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 11, $i, $I)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
