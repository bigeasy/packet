module.exports = function ({ $lookup }) {
    return {
        object: function () {
            const assert = require('assert')

            return function (object, {
                counter = (() => [ 0 ])()
            } = {}, $step = 0, $accumulator = []) {

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
                            value: {
                                first: 0,
                                second: 0
                            },
                            sentry: 0
                        }

                    case 1:

                        $accumulator['counter'] = counter

                    case 2:

                    case 3:

                        if ($start == $end) {
                            $step = 3
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.value.first = $buffer[$start++]

                    case 4:

                    case 5:

                        if ($start == $end) {
                            $step = 5
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.value.second = $buffer[$start++]

                    case 6:

                    case 7:

                        if ($start == $end) {
                            $step = 7
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]

                        object = (function ({ $_, counter }) {
                            console.log('>>>', counter)
                            assert.deepEqual(counter, [ 0 ])
                            return $_
                        })({
                            $_: object,
                            counter: $accumulator['counter']
                        })

                    }

                    return { start: $start, object: object, parse: null }
                }
            }
        } ()
    }
}
