module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        const assert = require('assert')

        return function ($buffer, $start) {
            let $accumulator = {}

            let object = {
                value: {
                    first: 0,
                    second: 0
                },
                sentry: 0
            }

            $accumulator['regex'] = /^abc$/

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

            return object
        }
    } ()
}
