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

                object.nudge = (
                    $buffer[$start++]
                ) >>> 0

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

                    if ($end - $start < 2) {
                        return parsers.inc.object(object, 7, $i)($buffer, $start, $end)
                    }

                    object.array[$i[0]] = (
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0

                    $i[0]++
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 10, $i)($buffer, $start, $end)
                }

                object.sentry = (
                    $buffer[$start++]
                ) >>> 0

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
