module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $i = [], $I = []

            let object = {
                nudge: 0,
                array: [],
                sentry: 0
            }

            object.nudge = $buffer[$start++]

            $i[0] = 0
            do {
                object.array[$i[0]] = []

                $I[0] = $buffer[$start++]
                $i[1] = 0

                for (; $i[1] < $I[0]; $i[1]++) {
                    object.array[$i[0]][$i[1]] = $buffer[$start++]
                }
            } while (++$i[0] != 2)

            object.sentry = $buffer[$start++]

            return object
        }
    } ()
}
