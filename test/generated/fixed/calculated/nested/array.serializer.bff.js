module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $i = [], $I = []

                    if ($end - $start < 1) {
                        return $incremental.object(object, 0, $i, $I)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    $I[0] = (() => 2)()

                    for ($i[0] = 0; $i[0] < $I[0]; $i[0]++) {
                        if ($end - $start < 1 + object.array[$i[0]].length * 1) {
                            return $incremental.object(object, 3, $i, $I)($buffer, $start, $end)
                        }

                        $buffer[$start++] = object.array[$i[0]].length & 0xff
                        $i[1] = 0

                        for (; $i[1] < object.array[$i[0]].length; $i[1]++) {
                            $buffer[$start++] = object.array[$i[0]][$i[1]] & 0xff
                        }
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 8, $i, $I)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
