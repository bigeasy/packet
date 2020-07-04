module.exports = function ({ serializers }) {
    serializers.all.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                let $$ = []

                ; (({ value = 0 }) => require('assert').equal(value, 1))({
                    value: object.value
                })

                $buffer[$start++] = (object.value & 0xff)

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
