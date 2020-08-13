module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $i = [], $$ = []

                    if ($end - $start < 1) {
                        return $incremental.object(object, 0, $i, $$)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    $$[0] = (function ($_) {
                        return $_.slice().reverse()
                    })(object.value)

                    if ($end - $start < 1 + object.value.length * 1) {
                        return $incremental.object(object, 3, $i, $$)($buffer, $start, $end)
                    }

                    $buffer[$start++] = $$[0].length & 0xff
                    $i[0] = 0

                    for (; $i[0] < $$[0].length; $i[0]++) {
                        $buffer[$start++] = $$[0][$i[0]] & 0xff
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 8, $i, $$)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
