module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $i = [], $I = []

                let object = {
                    nudge: 0,
                    value: [],
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1, $i, $I)($buffer, $start, $end)
                }

                object.nudge = ($buffer[$start++])

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 3, $i, $I)($buffer, $start, $end)
                }

                $I[0] = ($buffer[$start++])
                $i[0] = 0

                if ($end - $start < 1 * $I[0]) {
                    return parsers.inc.object(object, 5, $i, $I)($buffer, $start, $end)
                }

                for (; $i[0] < $I[0]; $i[0]++) {
                    object.value[$i[0]] = ($buffer[$start++])
                }

                object.value = (function ($_) {
                    return $_.slice().reverse()
                })(object.value)

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 8, $i, $I)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
