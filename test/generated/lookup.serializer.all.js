module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            let $_

            $buffer[$start++] = object.nudge & 0xff

            $_ = $lookup[0].indexOf(object.value)

            $buffer[$start++] = $_ & 0xff

            $_ = $lookup[1].indexOf(object.yn)

            $buffer[$start++] = $_ & 0xff

            $_ = $lookup[0].indexOf(object.binary)

            $buffer[$start++] = $_ & 0xff

            $_ = $lookup[2].reverse[object.mapped]

            $buffer[$start++] = $_ & 0xff

            $buffer[$start++] = object.sentry & 0xff

            return { start: $start, serialize: null }
        }
    } ()
}
