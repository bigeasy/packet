module.exports = function ({ serializers, $lookup }) {
    serializers.chk.object = function () {
        const assert = require('assert')

        return function (object) {
            return function ($buffer, $start, $end) {
                let $$ = [], $accumulator = {}

                $accumulator['regex'] = /^abc$/

                $$[0] = (function ({ $_, regex }) {
                    assert(regex.test('abc'))
                    return $_
                })({
                    $_: object,
                    regex: $accumulator['regex']
                })

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 2, $$, $accumulator)($buffer, $start, $end)
                }

                $buffer[$start++] = ($$[0].value.first & 0xff)

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 4, $$, $accumulator)($buffer, $start, $end)
                }

                $buffer[$start++] = ($$[0].value.second & 0xff)

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 6, $$, $accumulator)($buffer, $start, $end)
                }

                $buffer[$start++] = ($$[0].sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
