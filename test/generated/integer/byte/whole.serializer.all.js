module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                $buffer[$start++] = object.word & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
