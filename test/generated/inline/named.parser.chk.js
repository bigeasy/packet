module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let object = {
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 4) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.value =
                    ($buffer[$start++]) * 0x1000000 +
                    ($buffer[$start++]) * 0x10000 +
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])

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

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 3)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
