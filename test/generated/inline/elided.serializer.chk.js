module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $$ = []

                    $$[0] = (value => value)(object)

                    if ($end - $start < 2) {
                        return $incremental.object(object, 1, $$)($buffer, $start, $end)
                    }

                    $buffer[$start++] = $$[0].value >>> 8 & 0xff
                    $buffer[$start++] = $$[0].value & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
