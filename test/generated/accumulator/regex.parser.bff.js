module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            const assert = require('assert')

            return function ({
                regex = /^abc$/
            } = {}) {
                return function ($buffer, $start, $end) {
                    let $accumulator = {}

                    let object = {
                        value: {
                            first: 0,
                            second: 0
                        },
                        sentry: 0
                    }

                    $accumulator['regex'] = regex

                    if ($end - $start < 3) {
                        return $incremental.object(object, {
                            regex: regex
                        }, 2, $accumulator)($buffer, $start, $end)
                    }

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

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
