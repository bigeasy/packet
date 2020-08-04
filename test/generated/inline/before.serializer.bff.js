module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $$ = []

                    if ($end - $start < 1 + 2) {
                        return $incremental.object(object, 0, $$)($buffer, $start, $end)
                    }

                    $$[0] = (value => value)(object.value)

                    $buffer[$start++] = $$[0] >>> 8 & 0xff
                    $buffer[$start++] = $$[0] & 0xff

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
