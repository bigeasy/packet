module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $i = [], $$ = []

                $$[0] = ((value) => Buffer.from(String(value)))(object.value)

                $$[0].copy($buffer, $start, 0, $$[0].length)
                $start += $$[0].length

                $buffer[$start++] = 0x0

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
