module.exports = function ({ parsers }) {
    parsers.bff.object = function () {
        return function () {
            return function parse ($buffer, $start, $end) {
                let object = {
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 2) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.value = ($buffer[$start++])

                ; (($_ = 0) => require('assert').equal($_, 1))(object.value)

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
