module.exports = function ({ $lookup }) {
    return {
        object: function () {
            const assert = require('assert')

            return function (object, {
                counter = (() => [ 0 ])()
            } = {}, $step = 0, $$ = [], $accumulator = {}) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $accumulator['counter'] = counter

                    case 1:

                        $$[0] = (function ({ $_, counter }) {
                            console.log('>>>', counter)
                            assert.deepEqual(counter, [ 0 ])
                            return $_
                        })({
                            $_: object,
                            counter: $accumulator['counter']
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

                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
