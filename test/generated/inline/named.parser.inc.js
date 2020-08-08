module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
                            value: 0,
                            sentry: 0
                        }

                    case 1:

                        $_ = 0
                        $bite = 3

                    case 2:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite--
                        }

                        object.value = $_

                        object.value = (function ({ $_, $, $path, $i, $direction }) {
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
                            $direction: 'parse'
                        })

                    case 3:

                    case 4:

                        if ($start == $end) {
                            $step = 4
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]

                    }

                    return { start: $start, object: object, parse: null }
                }
            }
        } ()
    }
}
