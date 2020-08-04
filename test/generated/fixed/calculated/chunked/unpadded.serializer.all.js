module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $_, $i = [], $I = []

                $buffer[$start++] = object.nudge & 0xff

                $I[0] = (() => 8)()

                $_ = 0
                for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                    object.array[$i[0]].copy($buffer, $start)
                    $start += object.array[$i[0]].length
                    $_ += object.array[$i[0]].length
                }

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
