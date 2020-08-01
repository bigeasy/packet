module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            let $i = []

            $buffer[$start++] = object.nudge & 0xff

            {
                const length = object.array.reduce((sum, buffer) => sum + buffer.length, 0)
                $buffer[$start++] = length & 0xff
            }

            {
                for (let i = 0, I = object.array.length; i < I; i++) {
                    object.array[i].copy($buffer, $start, 0, object.array[i].length)
                    $start += object.array[i].length
                }
            }

            $buffer[$start++] = object.sentry & 0xff

            return { start: $start, serialize: null }
        }
    } ()
}
