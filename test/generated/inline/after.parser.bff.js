module.exports = function ({ parsers }) {
    parsers.bff.object = function () {
        return function () {
            return function parse ($buffer, $start, $end) {
                let object = {
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 3) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.value =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])

                object.value = (value => value)(object.value)

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
