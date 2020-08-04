module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $_, $i = [], $$ = []

                    if ($end - $start < 1 + 8) {
                        return $incremental.object(object, 0, $i, $$)($buffer, $start, $end)
                    }

                    $$[0] = (function (value) {
                        const buffer = Buffer.alloc(8)
                        buffer.writeDoubleLE(value)
                        return buffer
                    })(object.value)

                    $_ = 0
                    $$[0].copy($buffer, $start)
                    $start += $$[0].length
                    $_ += $$[0].length

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
