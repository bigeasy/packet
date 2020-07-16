module.exports = function ({ parsers }) {
    parsers.inc.object = function () {
        const assert = require('assert')

        return function (object, $step = 0, $accumulator = []) {
            let $_, $bite

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

                    $step = 1

                case 1:

                    $accumulator['regex'] = /^abc$/

                case 2:

                    $step = 3

                case 3:

                    if ($start == $end) {
                        return { start: $start, object: null, parse: $parse }
                    }

                    object.value.first = $buffer[$start++]


                case 4:

                    $step = 5

                case 5:

                    if ($start == $end) {
                        return { start: $start, object: null, parse: $parse }
                    }

                    object.value.second = $buffer[$start++]


                case 6:

                    $step = 7

                case 7:

                    if ($start == $end) {
                        return { start: $start, object: null, parse: $parse }
                    }

                    object.sentry = $buffer[$start++]

                    object = (function ({ $_, regex }) {
                        assert(regex.test('abc'))
                        return $_
                    })({
                        $_: object,
                        regex: $accumulator['regex']
                    })

                case 8:

                    return { start: $start, object: object, parse: null }
                }
            }
        }
    } ()
}
