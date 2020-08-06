module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            const assert = require('assert')

            return function (object, {
                regex = /^abc$/
            } = {}) {
                return function ($buffer, $start, $end) {
                    let $$ = [], $accumulator = {}

                    $accumulator['regex'] = regex

                    $$[0] = (function ({ $_, regex }) {
                        assert(regex.test('abc'))
                        return $_
                    })({
                        $_: object,
                        regex: $accumulator['regex']
                    })

                    if ($end - $start < 1) {
                        return $incremental.object(object, {
                            regex: regex
                        }, 2, $$, $accumulator)($buffer, $start, $end)
                    }

                    $buffer[$start++] = $$[0].value.first & 0xff

                    if ($end - $start < 1) {
                        return $incremental.object(object, {
                            regex: regex
                        }, 4, $$, $accumulator)($buffer, $start, $end)
                    }

                    $buffer[$start++] = $$[0].value.second & 0xff

                    if ($end - $start < 1) {
                        return $incremental.object(object, {
                            regex: regex
                        }, 6, $$, $accumulator)($buffer, $start, $end)
                    }

                    $buffer[$start++] = $$[0].sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
