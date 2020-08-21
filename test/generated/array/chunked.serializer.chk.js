module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $I = []

                    if ($end - $start < 1) {
                        return $incremental.object(object, 0, $I)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    if ($end - $start < 1) {
                        return $incremental.object(object, 2, $I)($buffer, $start, $end)
                    }

                    $I[0] = object.array.reduce((sum, buffer) => sum + buffer.length, 0)
                    $buffer[$start++] = $I[0] & 0xff

                    if ($end - $start < 0 + object.array.reduce((sum, buffer) => sum + buffer.length, 0)) {
                        return $incremental.object(object, 5, $I)($buffer, $start, $end)
                    }

                    {
                        for (let i = 0, I = object.array.length; i < I; i++) {
                            object.array[i].copy($buffer, $start, 0, object.array[i].length)
                            $start += object.array[i].length
                        }
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 6, $I)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
