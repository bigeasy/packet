module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        const assert = require('assert')

        return function ($buffer, $start) {
            let $accumulator = {}

            let object = {
                value: {
                    first: 0,
                    second: 0
                },
                sentry: 0
            }

            $accumulator['counter'] = [ 0 ]

            object.value.first = ($buffer[$start++])

            object.value.second = ($buffer[$start++])

            object.sentry = ($buffer[$start++])

            object = (function ({ $_, counter }) {
                assert.deepEqual(counter, [ 0 ])
                return $_
            })({
                $_: object,
                counter: $accumulator['counter']
            })

            return object
        }
    } ()
}
