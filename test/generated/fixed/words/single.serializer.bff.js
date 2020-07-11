module.exports = function ({ serializers }) {
    serializers.bff.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = []

                if ($end - $start < 9 + 1 * object.sentry.length) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                    $buffer[$start++] = (object.array[$i[0]] & 0xff)
                }

                for (;;) {
                    if ($i[0] == 8) {
                        break
                    }
                    $buffer[$start++] = 0x0
                    $i[0]++
                }

                for ($i[0] = 0; $i[0] < object.sentry.length; $i[0]++) {
                    $buffer[$start++] = (object.sentry[$i[0]] & 0xff)
                }

                $buffer[$start++] = 0x0

                return { start: $start, serialize: null }
            }
        }
    } ()
}
