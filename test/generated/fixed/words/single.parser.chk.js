module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
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

                object.nudge = ($buffer[$start++])

                if ($end - $start < 8) {
                    return parsers.inc.object(object, 3, $i)($buffer, $start, $end)
                }

                $i[0] = 0
                do {
                    if (
                        $buffer[$start] == 0x0
                    ) {
                        $start += 1
                        break
                    }

                    object.array[$i[0]] = ($buffer[$start++])
                } while (++$i[0] != 8)

                $start += 8 != $i[0]
                        ? (8 - $i[0]) * 1 - 1
                        : 0

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 11, $i)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
