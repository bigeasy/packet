module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            let $_, $i = [], $I = []

            $buffer[$start++] = object.nudge & 0xff

            $I[0] = (() => 8)()

            $_ = 0
            object.array.copy($buffer, $start)
            $start += object.array.length
            $_ += object.array.length

            $_ = $I[0] - $_
            $buffer.fill(0x0, $start, $start + $_)
            $start += $_

            $buffer[$start++] = object.sentry & 0xff

            return { start: $start, serialize: null }
        }
    } ()
}
