module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $I = []

                $buffer[$start++] = object.nudge & 0xff

                $I[0] = object.array.reduce((sum, buffer) => sum + buffer.length, 0)
                if ((value => value < 128)($I[0])) {
                    $buffer[$start++] = $I[0] & 0xff
                } else {
                    $buffer[$start++] = $I[0] >>> 7 & 0x7f | 0x80
                    $buffer[$start++] = $I[0] & 0x7f
                }

                {
                    for (let i = 0, I = object.array.length; i < I; i++) {
                        object.array[i].copy($buffer, $start, 0, object.array[i].length)
                        $start += object.array[i].length
                    }
                }

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
