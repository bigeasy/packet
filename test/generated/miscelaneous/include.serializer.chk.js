module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $i = []

                    if ($end - $start < 1) {
                        return $incremental.object(object, 0, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    if ($end - $start < 1) {
                        return $incremental.object(object, 2, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.value.length & 0xff
                    $i[0] = 0

                    for (; $i[0] < object.value.length; $i[0]++) {
                        if ($end - $start < 1) {
                            return $incremental.object(object, 5, $i)($buffer, $start, $end)
                        }

                        $buffer[$start++] = object.value[$i[0]] & 0xff
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 7, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
