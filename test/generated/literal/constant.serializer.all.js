module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                $buffer[$start++] = object.nudge & 0xff

                $buffer.write('fc', $start, $start + 1, 'hex')
                $start += 1


                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
