module.exports = function ({ serializers }) {
    serializers.inc.object = function () {


        return function (object, $step = 0, $$ = []) {
            let $bite, $stop, $_

            return function serialize ($buffer, $start, $end) {
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

                    $step = 2
                    $bite = 3
                    $_ = $$[0]

                case 2:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }


                case 3:

                    $step = 4
                    $bite = 0
                    $_ = object.sentry

                case 4:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }


                    $step = 5

                case 5:

                    break

                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
