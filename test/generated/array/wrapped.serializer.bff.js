module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $i = [], $$ = []

                    if ($end - $start < 4 + object.array.length * 1) {
                        return $incremental.object(object, 0, $i, $$)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    $buffer.write('cd', $start, $start + 1, 'hex')
                    $start += 1

                    $$[0] = (value => value)(object.array.length)

                    $buffer[$start++] = $$[0] & 0xff
                    $i[0] = 0

                    for (; $i[0] < object.array.length; $i[0]++) {
                        $buffer[$start++] = object.array[$i[0]] & 0xff
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
