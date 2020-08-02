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

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 3, $i, $I)($buffer, $start, $end)
                }

                $I[0] = (
                    $buffer[$start++]
                ) >>> 0

                if ($end - $start < 1 * $I[0]) {
                    return parsers.inc.object(object, 5, $i, $I)($buffer, $start, $end)
                }

                object.array = [ $buffer.slice($start, $start + $I[0]) ]
                $start += $I[0]

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 6, $i, $I)($buffer, $start, $end)
                }

                object.sentry = (
                    $buffer[$start++]
                ) >>> 0

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
