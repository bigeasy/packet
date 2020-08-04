module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $_, $i = [], $slice = null

                let object = {
                    nudge: 0,
                    array: null,
                    sentry: 0
                }

                object.nudge = $buffer[$start++]

                $slice = $buffer.slice($start, $start + 8)
                $start += 8
                object.array = $slice

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
