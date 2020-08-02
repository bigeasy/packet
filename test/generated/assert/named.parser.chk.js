module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let object = {
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.value = (
                    $buffer[$start++]
                ) >>> 0

                ; (({ value = 0 }) => require('assert').equal(value, 1))({
                    value: object.value
                })

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 3)($buffer, $start, $end)
                }

                object.sentry = (
                    $buffer[$start++]
                ) >>> 0

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
