module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $_, $i = [], $I = []

                $buffer[$start++] = (object.nudge & 0xff)

                $I[0] = (() => 8)()

                $_ = 0
                object.array.copy($buffer, $start)
                $start += object.array.length
                $_ += object.array.length

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
