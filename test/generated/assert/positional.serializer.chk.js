module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $$ = []

                    ; (($_ = 0) => require('assert').equal($_, 1))(object.value)

                    if ($end - $start < 1) {
                        return $incremental.object(object, 1, $$)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.value & 0xff

                    if ($end - $start < 1) {
                        return $incremental.object(object, 3, $$)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
