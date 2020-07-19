module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            $buffer[$start++] = (object.nudge & 0xff)

            $buffer.write("0faded", $start, $start + 3, 'hex')
            $start += 3

            $buffer[$start++] = (object.padded >>> 8 & 0xff)
            $buffer[$start++] = (object.padded & 0xff)

            $buffer.write("facade", $start, $start + 3, 'hex')
            $start += 3

            $buffer[$start++] = (object.sentry & 0xff)

            return { start: $start, serialize: null }
        }
    } ()
}
