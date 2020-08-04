module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $_, $i = []

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
        } ()
    }
}
