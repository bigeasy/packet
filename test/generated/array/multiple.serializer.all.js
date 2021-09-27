module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                $buffer[$start++] = object.nudge & 0xff

                $buffer[$start++] = object.first.length >>> 8 & 0xff
                $buffer[$start++] = object.first.length & 0xff

                object.first.copy($buffer, $start, 0, object.first.length)
                $start += object.first.length

                $buffer[$start++] = object.second.length >>> 8 & 0xff
                $buffer[$start++] = object.second.length & 0xff

                object.second.copy($buffer, $start, 0, object.second.length)
                $start += object.second.length

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
