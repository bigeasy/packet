module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        const assert = require('assert')

        return function ({
            counter = (() => [ 0 ])()
        } = {}) {
            return function ($buffer, $start, $end) {
                let $accumulator = {}

                let object = {
                    value: {
                        first: 0,
                        second: 0
                    },
                    sentry: 0
                }

                $accumulator['counter'] = counter

                if ($end - $start < 1) {
                    return parsers.inc.object(object, $accumulator, 2, {
                        counter: (() => [ 0 ])()
                    })($buffer, $start, $end)
                }

                object.value.first = ($buffer[$start++])

                if ($end - $start < 1) {
                    return parsers.inc.object(object, $accumulator, 4, {
                        counter: (() => [ 0 ])()
                    })($buffer, $start, $end)
                }

                object.value.second = ($buffer[$start++])

                if ($end - $start < 1) {
                    return parsers.inc.object(object, $accumulator, 6, {
                        counter: (() => [ 0 ])()
                    })($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                object = (function ({ $_, counter }) {
                    console.log('>>>', counter)
                    assert.deepEqual(counter, [ 0 ])
                    return $_
                })({
                    $_: object,
                    counter: $accumulator['counter']
                })

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
