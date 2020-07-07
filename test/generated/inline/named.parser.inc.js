module.exports = function ({ parsers }) {
    parsers.inc.object = function () {


        return function (object = {}, $step = 0) {
            let $_, $bite

            return function parse ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    object = {
                        value: 0,
                        sentry: 0
                    }

                    $step = 1

                case 1:

                    $_ = 0
                    $step = 2
                    $bite = 3

                case 2:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += ($buffer[$start++]) << $bite * 8 >>> 0
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

                    $step = 4

                case 4:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    object.sentry = $buffer[$start++]


                case 5:

                    return { start: $start, object: object, parse: null }
                }
            }
        }
    } ()
}
