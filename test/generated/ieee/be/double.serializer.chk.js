module.exports = function ({ serializers }) {
    serializers.chk.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = [], $$ = []

                $$[0] = (function (value) {
                    const buffer = Buffer.alloc(8)
                    buffer.writeDoubleBE(value)
                    return buffer
                })(object.value)

                if ($end - $start < 8) {
                    return serializers.inc.object(object, 1, $i, $$)($buffer, $start, $end)
                }

                for ($i[0] = 0; $i[0] < $$[0].length; $i[0]++) {
                    $buffer[$start++] = ($$[0][$i[0]] & 0xff)
                }


                if ($end - $start < 1) {
                    return serializers.inc.object(object, 4, $i, $$)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
