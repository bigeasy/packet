module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            const assert = require('assert')

            return function ({
                counter = [ 0 ]
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

                    $accumulator['counter'] = counter

                    if ($end - $start < 1) {
                        return $incremental.object(object, {
                            counter: [ 0 ]
                        }, 2, $accumulator)($buffer, $start, $end)
                    }

                    object.value.first = $buffer[$start++]

                    if ($end - $start < 1) {
                        return $incremental.object(object, {
                            counter: [ 0 ]
                        }, 4, $accumulator)($buffer, $start, $end)
                    }

                    object.value.second = $buffer[$start++]

                    if ($end - $start < 1) {
                        return $incremental.object(object, {
                            counter: [ 0 ]
                        }, 6, $accumulator)($buffer, $start, $end)
                    }

                    object.sentry = $buffer[$start++]

                    object = (function ({ $_, counter }) {
                        assert.deepEqual(counter, [ 0 ])
                        return $_
                    })({
                        $_: object,
                        counter: $accumulator['counter']
                    })

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
