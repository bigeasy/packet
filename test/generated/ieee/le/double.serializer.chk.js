module.exports = function ({ serializers, $lookup }) {
    serializers.chk.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $_, $i = [], $$ = []

                $$[0] = (function (value) {
                    const buffer = Buffer.alloc(8)
                    buffer.writeDoubleBE(value)
                    return buffer
                })(object.value)

                if ($end - $start < 8) {
                    return serializers.inc.object(object, 1, $i, $$)($buffer, $start, $end)
                }

                $_ = 0
                $$[0].copy($buffer, $start)
                $start += $$[0].length
                $_ += $$[0].length

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 3, $i, $$)($buffer, $start, $end)
                }

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        }
    } ()
}
