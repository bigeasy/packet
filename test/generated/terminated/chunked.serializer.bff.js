module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $_, $i = []

                    if ($end - $start < 4 + object.array.reduce((sum, buffer) => sum + buffer.length, 0)) {
                        return $incremental.object(object, 0, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    $_ = 0
                    for (let $index = 0; $index < object.array.length; $index++) {
                        object.array[$index].copy($buffer, $start)
                        $start += object.array[$index].length
                        $_ += object.array[$index].length
                    }

                    $buffer[$start++] = 0xd
                    $buffer[$start++] = 0xa

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
