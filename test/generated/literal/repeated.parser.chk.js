module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let object = {
                    nudge: 0,
                    padded: 0,
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.nudge = ($buffer[$start++])

                if ($end - $start < 14) {
                    return parsers.inc.object(object, 3)($buffer, $start, $end)
                }

                $start += 6

                object.padded =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])

                $start += 6

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 9)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
