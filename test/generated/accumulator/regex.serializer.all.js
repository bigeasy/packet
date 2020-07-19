module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        const assert = require('assert')

        return function (object, $buffer, $start) {
            let $$ = [], $accumulator = {}

            $accumulator['regex'] = /^abc$/

            $$[0] = (function ({ $_, regex }) {
                assert(regex.test('abc'))
                return $_
            })({
                $_: object,
                regex: $accumulator['regex']
            })

            $buffer[$start++] = ($$[0].value.first & 0xff)

            $buffer[$start++] = ($$[0].value.second & 0xff)

            $buffer[$start++] = ($$[0].sentry & 0xff)

            return { start: $start, serialize: null }
        }
    } ()
}
