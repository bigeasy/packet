module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            let $_, $i = [], $$ = []

            $$[0] = (function (value) {
                const buffer = Buffer.alloc(4)
                buffer.writeFloatLE(value)
                return buffer
            })(object.value)

            $_ = 0
            $$[0].copy($buffer, $start)
            $start += $$[0].length
            $_ += $$[0].length

            $buffer[$start++] = (object.sentry & 0xff)

            return { start: $start, serialize: null }
        }
    } ()
}
