module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $I = []

                let object = {
                    nudge: 0,
                    first: [],
                    second: [],
                    sentry: 0
                }

                object.nudge = $buffer[$start++]

                $I[0] =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

                object.first = $buffer.slice($start, $start + $I[0])
                $start += $I[0]

                $I[0] =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

                object.second = $buffer.slice($start, $start + $I[0])
                $start += $I[0]

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
