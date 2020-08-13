module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $i = []

                $buffer[$start++] = object.nudge & 0xff

                if ((value => value < 128)(object.array.length)) {
                    $buffer[$start++] = object.array.length & 0xff
                } else {
                    $buffer[$start++] = object.array.length >>> 7 & 0x7f | 0x80
                    $buffer[$start++] = object.array.length & 0x7f
                }

                object.array.copy($buffer, $start, 0, object.array.length)
                $start += object.array.length

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
