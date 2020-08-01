module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let object = {
                    nudge: 0,
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.nudge = $buffer[$start++]

                if ($end - $start < 2) {
                    return parsers.inc.object(object, 3)($buffer, $start, $end)
                }

                object.value =
                    $buffer[$start++] * 0x80 +
                    $buffer[$start++]

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 5)($buffer, $start, $end)
                }

                object.sentry = $buffer[$start++]

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
