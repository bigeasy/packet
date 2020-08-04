module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let object = {
                    nudge: 0,
                    padded: 0,
                    sentry: 0
                }

                object.nudge = $buffer[$start++]

                $start += 6

                object.padded = (
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

                $start += 6

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
