module.exports = function ({ serializers }) {
    serializers.chk.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                let $_, $i = []

                if ($end - $start < 8) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                $_ = $start
                object.array.copy($buffer, $start)
                $start += object.array.length
                $_ += object.array.length

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 2, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
