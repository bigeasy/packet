module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $_, $i = [], $I = []

                    if ($end - $start < 1) {
                        return $incremental.object(object, 0, $i, $I)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    $I[0] = (() => 8)()

                    if ($end - $start < $I[0] * 1) {
                        return $incremental.object(object, 2, $i, $I)($buffer, $start, $end)
                    }

                    $_ = 0
                    for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                        object.array[$i[0]].copy($buffer, $start)
                        $start += object.array[$i[0]].length
                        $_ += object.array[$i[0]].length
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 4, $i, $I)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
