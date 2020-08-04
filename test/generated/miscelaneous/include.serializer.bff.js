module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $i = []

                    if ($end - $start < 3 + object.value.length * 1) {
                        return $incremental.object(object, 0, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    $buffer[$start++] = object.value.length & 0xff

                    for ($i[0] = 0; $i[0] < object.value.length; $i[0]++) {
                        $buffer[$start++] = object.value[$i[0]] & 0xff
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
