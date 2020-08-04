module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
