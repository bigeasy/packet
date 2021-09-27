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

                $I[0] =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                $i[0] = 0

                for (; $i[0] < $I[0]; $i[0]++) {
                    object.array[$i[0]] =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                }

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
