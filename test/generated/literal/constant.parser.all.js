module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let object = {
                    nudge: 0,
                    sentry: 0
                }

                object.nudge = $buffer[$start++]

                $start += 1


                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
