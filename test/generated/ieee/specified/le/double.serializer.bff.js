module.exports = function ({ serializers }) {
    serializers.bff.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = [], $$ = []

                if ($end - $start < 1 + 8) {
                    return serializers.inc.object(object, 0, $i, $$)($buffer, $start, $end)
                }

                $$[0] = (function (value) {
                    const buffer = Buffer.alloc(8)
                    buffer.writeDoubleLE(value)
                    return buffer
                })(object.value)

                for ($i[0] = 0; $i[0] < $$[0].length; $i[0]++) {
                    $buffer[$start++] = ($$[0][$i[0]] & 0xff)
                }


                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
