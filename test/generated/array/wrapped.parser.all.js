module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $i = [], $I = []

                let object = {
                    nudge: 0,
                    array: [],
                    sentry: 0
                }

                object.nudge = $buffer[$start++]

                $start += 1

                $I[0] = $buffer[$start++]

                $I[0] = (value => value)($I[0])
                $i[0] = 0

                for (; $i[0] < $I[0]; $i[0]++) {
                    object.array[$i[0]] = $buffer[$start++]
                }

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
