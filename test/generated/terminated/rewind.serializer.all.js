module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            let $i = []

            $buffer[$start++] = object.nudge & 0xff

            object.array.copy($buffer, $start, 0, object.array.length)
            $start += object.array.length

            $buffer[$start++] = 0x61
            $buffer[$start++] = 0x62
            $buffer[$start++] = 0x63
            $buffer[$start++] = 0x61
            $buffer[$start++] = 0x62
            $buffer[$start++] = 0x64

            $buffer[$start++] = object.sentry & 0xff

            return { start: $start, serialize: null }
        }
    } ()
}
