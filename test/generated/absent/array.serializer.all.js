module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                return { start: $start, serialize: null }
            }
        } ()
    }
}
