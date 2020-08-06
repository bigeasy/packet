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

                    if ($end - $start < 1) {
                        return $incremental.object(object, {
                            regex: regex
                        }, 2, $accumulator)($buffer, $start, $end)
                    }

                    object.value.first = $buffer[$start++]

                    if ($end - $start < 1) {
                        return $incremental.object(object, {
                            regex: regex
                        }, 4, $accumulator)($buffer, $start, $end)
                    }

                    object.value.second = $buffer[$start++]

                    if ($end - $start < 1) {
                        return $incremental.object(object, {
                            regex: regex
                        }, 6, $accumulator)($buffer, $start, $end)
                    }

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
