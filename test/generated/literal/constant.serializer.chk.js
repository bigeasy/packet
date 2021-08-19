module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    if ($end - $start < 1) {
                        return $incremental.object(object, 0)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    if ($end - $start < 1) {
                        return $incremental.object(object, 2)($buffer, $start, $end)
                    }

                    $buffer.write('fc', $start, $start + 1, 'hex')
                    $start += 1


                    if ($end - $start < 1) {
                        return $incremental.object(object, 4)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
