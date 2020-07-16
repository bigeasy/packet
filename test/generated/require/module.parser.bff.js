module.exports = function ({ parsers }) {
    parsers.bff.object = function () {
        const twiddle = require('../../../test/cycle/twiddle')

        return function () {
            return function ($buffer, $start, $end) {
                let object = {
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 5) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.value =
                    ($buffer[$start++]) * 0x1000000 +
                    ($buffer[$start++]) * 0x10000 +
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])

                object.value = (value => twiddle(value))(object.value)

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
