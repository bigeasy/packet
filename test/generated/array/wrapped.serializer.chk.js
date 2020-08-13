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

                    if ($end - $start < 2) {
                        return $incremental.object(object, 2, $i, $$)($buffer, $start, $end)
                    }

                    $buffer.write('cd', $start, $start + 1, 'hex')
                    $start += 1

                    $$[0] = (value => value)(object.array.length)

                    $buffer[$start++] = $$[0] & 0xff
                    $i[0] = 0

                    for (; $i[0] < object.array.length; $i[0]++) {
                        if ($end - $start < 1) {
                            return $incremental.object(object, 8, $i, $$)($buffer, $start, $end)
                        }

                        $buffer[$start++] = object.array[$i[0]] & 0xff
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 10, $i, $$)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
