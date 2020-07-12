module.exports = function ({ serializers }) {
    serializers.bff.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                let $_, $i = []

                if ($end - $start < 9 + object.sentry.length * 1) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                $_ = $start
                object.array.copy($buffer, $start)
                $start += object.array.length
                $_ += object.array.length

                for ($i[0] = 0; $i[0] < object.sentry.length; $i[0]++) {
                    $buffer[$start++] = (object.sentry[$i[0]] & 0xff)
                }

                $buffer[$start++] = 0x0

                return { start: $start, serialize: null }
            }
        }
    } ()
}
