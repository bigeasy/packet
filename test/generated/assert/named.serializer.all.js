module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            let $$ = []

            ; (({ value = 0 }) => require('assert').equal(value, 1))({
                value: object.value
            })

            $buffer[$start++] = object.value & 0xff

            $buffer[$start++] = object.sentry & 0xff

            return { start: $start, serialize: null }
        }
    } ()
}
