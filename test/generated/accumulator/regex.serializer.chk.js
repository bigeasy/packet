module.exports = function ({ serializers, $lookup }) {
    serializers.chk.object = function () {
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
                    return serializers.inc.object(object, $accumulator, 2, $$, {
                        regex: /^abc$/
                    })($buffer, $start, $end)
                }

                $buffer[$start++] = ($$[0].value.first & 0xff)

                if ($end - $start < 1) {
                    return serializers.inc.object(object, $accumulator, 4, $$, {
                        regex: /^abc$/
                    })($buffer, $start, $end)
                }

                $buffer[$start++] = ($$[0].value.second & 0xff)

                if ($end - $start < 1) {
                    return serializers.inc.object(object, $accumulator, 6, $$, {
                        regex: /^abc$/
                    })($buffer, $start, $end)
                }

                $buffer[$start++] = ($$[0].sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
