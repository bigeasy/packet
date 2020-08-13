module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $i = []

                    if ($end - $start < 4 + object.array.length * 4) {
                        return $incremental.object(object, 0, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    $buffer[$start++] = object.array.length >>> 8 & 0xff
                    $buffer[$start++] = object.array.length & 0xff
                    $i[0] = 0

                    for (; $i[0] < object.array.length; $i[0]++) {
                        $buffer[$start++] = object.array[$i[0]].first >>> 8 & 0xff
                        $buffer[$start++] = object.array[$i[0]].first & 0xff

                        $buffer[$start++] = object.array[$i[0]].second >>> 8 & 0xff
                        $buffer[$start++] = object.array[$i[0]].second & 0xff
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
