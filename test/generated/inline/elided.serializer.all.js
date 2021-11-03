module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $$ = []

                $$[0] = (value => value)(object)

                $buffer[$start++] = $$[0].value >>> 8 & 0xff
                $buffer[$start++] = $$[0].value & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
