module.exports = function ({ serializers, $lookup }) {
    serializers.bff.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $$ = []

                if ($end - $start < 1 + 1) {
                    return serializers.inc.object(object, 0, $$)($buffer, $start, $end)
                }

                ; (($_ = 0) => require('assert').equal($_, 1))(object.value)

                $buffer[$start++] = object.value & 0xff

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        }
    } ()
}
