module.exports = function ({ serializers, $lookup }) {
    serializers.bff.object = function () {
        const assert = require('assert')

        return function (object) {
            return function ($buffer, $start, $end) {
                let $$ = [], $accumulator = {}

                $accumulator['regex'] = /^abc$/

                if ($end - $start < 3) {
                    return serializers.inc.object(object, 1, $$, $accumulator)($buffer, $start, $end)
                }

                $$[0] = (function ({ $_, regex }) {
                    assert(regex.test('abc'))
                    return $_
                })({
                    $_: object,
                    regex: $accumulator['regex']
                })

                $buffer[$start++] = ($$[0].value.first & 0xff)

                $buffer[$start++] = ($$[0].value.second & 0xff)

                $buffer[$start++] = ($$[0].sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
