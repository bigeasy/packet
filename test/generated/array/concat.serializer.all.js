module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $i = []

                $buffer[$start++] = object.nudge & 0xff

                $buffer[$start++] = object.array.length & 0xff

                object.array.copy($buffer, $start, 0, object.array.length)
                $start += object.array.length

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
