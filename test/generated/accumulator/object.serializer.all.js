module.exports = function ({ $lookup }) {
    return {
        object: function () {
            const assert = require('assert')

            return function (object, $buffer, $start, {
                counter = [ 0 ]
            } = {}) {
                let $$ = [], $accumulator = {}

                $accumulator['counter'] = counter

                $$[0] = (function ({ $_, counter }) {
                    assert.deepEqual(counter, [ 0 ])
                    return $_
                })({
                    $_: object,
                    counter: $accumulator['counter']
                })

                $buffer[$start++] = $$[0].value.first & 0xff

                $buffer[$start++] = $$[0].value.second & 0xff

                $buffer[$start++] = $$[0].sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
