module.exports = function ({ parsers }) {
    parsers.bff.object = function () {
        const assert = require('assert')

        return function () {
            return function parse ($buffer, $start, $end) {
                let $accumulator = {}

                let object = {
                    value: {
                        first: 0,
                        second: 0
                    },
                    sentry: 0
                }

                $accumulator['regex'] = /^abc$/

                if ($end - $start < 3) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.value.first = ($buffer[$start++])

                object.value.second = ($buffer[$start++])

                object.sentry = ($buffer[$start++])

                object = (function ({ $_, regex }) {
                    assert(regex.test('abc'))
                    return $_
                })({
                    $_: object,
                    regex: $accumulator['regex']
                })

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
