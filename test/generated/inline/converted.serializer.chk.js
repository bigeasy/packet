module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $i = [], $$ = []

                    $$[0] = ((value) => Buffer.from(String(value)))(object.value)

                    if ($end - $start < 1 + $$[0].length) {
                        return $incremental.object(object, 1, $i, $$)($buffer, $start, $end)
                    }

                    $$[0].copy($buffer, $start, 0, $$[0].length)
                    $start += $$[0].length

                    $buffer[$start++] = 0x0

                    if ($end - $start < 1) {
                        return $incremental.object(object, 4, $i, $$)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
