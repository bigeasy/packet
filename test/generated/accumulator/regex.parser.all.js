module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        const assert = require('assert')

        return function ($buffer, $start, {
            regex = /^abc$/
        } = {}) {
            let $accumulator = {}

            let object = {
                value: {
                    first: 0,
                    second: 0
                },
                sentry: 0
            }

            $accumulator['regex'] = regex

            object.value.first = (
                $buffer[$start++]
            ) >>> 0

            object.value.second = (
                $buffer[$start++]
            ) >>> 0

            object.sentry = (
                $buffer[$start++]
            ) >>> 0

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
