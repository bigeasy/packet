module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let object = {
                    nudge: 0,
                    padded: 0,
                    sentry: 0
                }

                if ($end - $start < 10) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.nudge = $buffer[$start++]

                $start += 3

                object.padded = (
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

                $start += 3

                object.sentry = $buffer[$start++]

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
