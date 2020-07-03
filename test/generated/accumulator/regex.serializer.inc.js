module.exports = function ({ serializers }) {
    serializers.inc.object = function () {
        const assert = require('assert')

        return function (object, $step = 0, $$ = [], $accumulator = {}) {
            let $bite, $stop, $_

            return function serialize ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    $accumulator['regex'] = /^abc$/

                case 1:

                    $$[0] = (function ({ $_, regex }) {
                        assert(regex.test('abc'))
                        return $_
                    })({
                        $_: object,
                        regex: $accumulator['regex']
                    })

                case 2:

                    $step = 3
                    $bite = 0
                    $_ = $$[0].value.first

                case 3:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }


                case 4:

                    $step = 5
                    $bite = 0
                    $_ = $$[0].value.second

                case 5:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }


                case 6:

                    $step = 7
                    $bite = 0
                    $_ = $$[0].sentry

                case 7:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }


                    $step = 8

                case 8:

                    break

                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
