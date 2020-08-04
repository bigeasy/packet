module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                $buffer[$start++] = object.nudge & 0xff

                $buffer[$start++] = object.value >>> 7 & 0x7f
                $buffer[$start++] = object.value & 0x7f

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
