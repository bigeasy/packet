module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $$ = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $$[0] = (function ({ $_, $, $path, $i, $direction }) {
                            const assert = require('assert')
                            if ($direction == 'serialize') {
                                assert.deepEqual({ $_, $, $path, $i, $direction }, {
                                    $_: 1,
                                    $: { value: 1, sentry: 0xaa },
                                    $path: [ 'object', 'value' ],
                                    $i: [],
                                    $direction: 'serialize'
                                })
                            } else {
                                assert.deepEqual({ $_, $, $path, $i, $direction }, {
                                    $_: 4294967294,
                                    $: { value: 4294967294, sentry: 0 },
                                    $path: [ 'object', 'value' ],
                                    $i: [],
                                    $direction: 'parse'
                                })
                            }
                            return ~$_
                        })({
                            $_: object.value,
                            $: object,
                            $path: [ 'object', 'value' ],
                            $i: [],
                            $direction: 'serialize'
                        })

                    case 1:

                        $bite = 3
                        $_ = $$[0]

                    case 2:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 2
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }

                    case 3:

                        $bite = 0
                        $_ = object.sentry

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 4
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
