module.exports = function ({ serializers }) {
    serializers.bff.object = function () {
        const assert = require('assert')

        return function (object) {
            return function ($buffer, $start, $end) {
                let $$ = [], $accumulator = {}

                $accumulator['counter'] = [ 0 ]

                if ($end - $start < 3) {
                    return serializers.inc.object(object, 1, $$, $accumulator)($buffer, $start, $end)
                }

                $$[0] = (function ({ $_, counter }) {
                    assert.deepEqual(counter, [ 0 ])
                    return $_
                })({
                    $_: object,
                    counter: $accumulator['counter']
                })

                $buffer[$start++] = ($$[0].value.first & 0xff)

                $buffer[$start++] = ($$[0].value.second & 0xff)

                $buffer[$start++] = ($$[0].sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
