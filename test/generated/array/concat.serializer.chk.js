module.exports = function ({ serializers }) {
    serializers.chk.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = []

                if ($end - $start < 1 + object.array.length) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.array.length & 0xff)

                object.array.copy($buffer, $start, 0, object.array.length)
                $start += object.array.length

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 3, $i)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
