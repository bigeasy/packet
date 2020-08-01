module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $_

                let object = {
                    nudge: 0,
                    value: 0,
                    yn: 0,
                    binary: 0,
                    mapped: 0,
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.nudge = $buffer[$start++]

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 3)($buffer, $start, $end)
                }

                $_ = $buffer[$start++]

                object.value = $lookup[0][$_]

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 5)($buffer, $start, $end)
                }

                $_ = $buffer[$start++]

                object.yn = $lookup[1][$_]

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 7)($buffer, $start, $end)
                }

                $_ = $buffer[$start++]

                object.binary = $lookup[0][$_]

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 9)($buffer, $start, $end)
                }

                $_ = $buffer[$start++]

                object.mapped = $lookup[2].forward[$_]

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 11)($buffer, $start, $end)
                }

                object.sentry = $buffer[$start++]

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
