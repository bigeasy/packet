module.exports = function ({ serializers }) {
    serializers.all.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                $buffer[$start++] = (object.value.first & 0xff)

                $buffer[$start++] = (object.value.second & 0xff)

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
