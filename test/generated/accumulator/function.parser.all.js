module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        const assert = require('assert')

        return function ($buffer, $start, {
            counter = (() => [ 0 ])()
        } = {}) {
            let $accumulator = {}

            let object = {
                value: {
                    first: 0,
                    second: 0
                },
                sentry: 0
            }

            $accumulator['counter'] = counter

            object.value.first = (
                $buffer[$start++]
            ) >>> 0

            object.value.second = (
                $buffer[$start++]
            ) >>> 0

            object.sentry = (
                $buffer[$start++]
            ) >>> 0

            object = (function ({ $_, counter }) {
                console.log('>>>', counter)
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
