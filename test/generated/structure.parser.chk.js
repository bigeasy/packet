module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let object = {
                    value: {
                        first: 0,
                        second: 0
                    },
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.value.first = (
                    $buffer[$start++]
                ) >>> 0

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 3)($buffer, $start, $end)
                }

                object.value.second = (
                    $buffer[$start++]
                ) >>> 0

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 5)($buffer, $start, $end)
                }

                object.sentry = (
                    $buffer[$start++]
                ) >>> 0

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
