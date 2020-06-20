module.exports = function (serializers) {
    serializers.all.object = function (object) {
        return function ($buffer, $start, $end) {
            let $i = []

            $i[0] = (value => -value)(object.value)

            $buffer[$start++] = ($i[0] >>> 8 & 0xff)
            $buffer[$start++] = ($i[0] & 0xff)

            $buffer[$start++] = (object.sentry & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
