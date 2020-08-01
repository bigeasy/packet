module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            let $$ = []

            ; (({ $_ = 0 }) => require('assert').equal($_, 1))({
                $_: object.value
            })

            $buffer[$start++] = object.value & 0xff

            $buffer[$start++] = object.sentry & 0xff

            return { start: $start, serialize: null }
        }
    } ()
}
