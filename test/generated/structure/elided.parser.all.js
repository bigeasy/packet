module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let object = {
                    first: 0,
                    second: 0,
                    sentry: 0
                }

                object.first = $buffer[$start++]

                object.second = $buffer[$start++]

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
