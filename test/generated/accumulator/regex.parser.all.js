module.exports = function ({ $lookup }) {
    return {
        object: function () {
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

                object.value.first = $buffer[$start++]

                object.value.second = $buffer[$start++]

                object.sentry = $buffer[$start++]

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
}
