module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $$ = []

                $$[0] = (value => value)(object.value)

                $buffer[$start++] = $$[0] >>> 8 & 0xff
                $buffer[$start++] = $$[0] & 0xff

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
