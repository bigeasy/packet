module.exports = function ({ serializers, $lookup }) {
    serializers.bff.object = function () {
        const assert = require('assert')

        return function (object, {
            counter = (() => [ 0 ])()
        } = {}) {
            return function ($buffer, $start, $end) {
                let $$ = [], $accumulator = {}

                $accumulator['counter'] = counter

                if ($end - $start < 3) {
                    return serializers.inc.object(object, {
                        counter: (() => [ 0 ])()
                    }, 1, $$, $accumulator)($buffer, $start, $end)
                }

                $$[0] = (function ({ $_, counter }) {
                    console.log('>>>', counter)
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
