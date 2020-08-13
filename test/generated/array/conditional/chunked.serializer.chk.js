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

                    $I[0] = object.array.reduce((sum, buffer) => sum + buffer.length, 0)
                    if ((value => value < 128)($I[0])) {
                        if ($end - $start < 1) {
                            return $incremental.object(object, 4, $i, $I)($buffer, $start, $end)
                        }

                        $buffer[$start++] = $I[0] & 0xff
                    } else {
                        if ($end - $start < 2) {
                            return $incremental.object(object, 6, $i, $I)($buffer, $start, $end)
                        }

                        $buffer[$start++] = $I[0] >>> 7 & 0x7f | 0x80
                        $buffer[$start++] = $I[0] & 0x7f
                    }

                    if ($end - $start < 0 + object.array.reduce((sum, buffer) => sum + buffer.length, 0)) {
                        return $incremental.object(object, 9, $i, $I)($buffer, $start, $end)
                    }

                    {
                        for (let i = 0, I = object.array.length; i < I; i++) {
                            object.array[i].copy($buffer, $start, 0, object.array[i].length)
                            $start += object.array[i].length
                        }
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 10, $i, $I)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
