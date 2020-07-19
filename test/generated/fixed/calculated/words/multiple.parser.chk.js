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

                $I[0] = (() => 16)()

                if ($end - $start < $I[0] * 1) {
                    return parsers.inc.object(object, 3, $i, $I)($buffer, $start, $end)
                }

                $i[0] = 0
                do {
                    if (
                        $buffer[$start] == 0xd &&
                        $buffer[$start + 1] == 0xa
                    ) {
                        $start += 2
                        break
                    }

                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 7, $i, $I)($buffer, $start, $end)
                    }

                    object.array[$i[0]] = ($buffer[$start++])
                } while (++$i[0] != $I[0])

                $start += $I[0] != $i[0]
                        ? ($I[0] - $i[0]) * 1 - 2
                        : 0

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 12, $i, $I)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
