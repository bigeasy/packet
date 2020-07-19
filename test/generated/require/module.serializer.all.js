module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        const twiddle = require('../../cycle/twiddle')

        return function (object, $buffer, $start) {
            let $$ = []

            $$[0] = (value => twiddle(value))(object.value)

            $buffer[$start++] = ($$[0] >>> 24 & 0xff)
            $buffer[$start++] = ($$[0] >>> 16 & 0xff)
            $buffer[$start++] = ($$[0] >>> 8 & 0xff)
            $buffer[$start++] = ($$[0] & 0xff)

            $buffer[$start++] = (object.sentry & 0xff)

            return { start: $start, serialize: null }
        }
    } ()
}
