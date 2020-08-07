module.exports = function ({ $lookup }) {
    return {
        object: function () {
            const assert = require('assert')

            return function (object, {
                regex = /^abc$/
            } = {}, $step = 0, $$ = [], $accumulator = {}) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $accumulator['regex'] = regex

                    case 1:

                        $$[0] = (function ({ $_, regex }) {
                            assert(regex.test('abc'))
                            return $_
                        })({
                            $_: object,
                            regex: $accumulator['regex']
                        })

                    case 2:

                        $bite = 0
                        $_ = $$[0].value.first

                    case 3:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 3
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                    case 4:

                        $bite = 0
                        $_ = $$[0].value.second

                    case 5:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 5
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                    case 6:

                        $bite = 0
                        $_ = $$[0].sentry

                    case 7:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 7
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
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
}
