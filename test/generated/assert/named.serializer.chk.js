module.exports = function ({ serializers }) {
    serializers.chk.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $$ = []

                ; (({ value = 0 }) => require('assert').equal(value, 1))({
                    value: object.value
                })

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 1, $$)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.value & 0xff)

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 3, $$)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
