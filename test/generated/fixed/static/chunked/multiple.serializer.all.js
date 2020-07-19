module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            let $_, $i = []

            $buffer[$start++] = (object.nudge & 0xff)

            $_ = 0
            for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                object.array[$i[0]].copy($buffer, $start)
                $start += object.array[$i[0]].length
                $_ += object.array[$i[0]].length
            }

            $_ = 8 - $_
            $buffer.fill(Buffer.from([ 0xd, 0xa ]), $start, $start + $_)
            $start += $_

            $buffer[$start++] = (object.sentry & 0xff)

            return { start: $start, serialize: null }
        }
    } ()
}
