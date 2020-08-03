module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $i = []

            let object = {
                nudge: 0,
                array: [],
                sentry: 0
            }

            object.nudge = $buffer[$start++]

            $i[0] = 0
            do {
                if (
                    $buffer[$start] == 0x0
                ) {
                    $start += 1
                    break
                }

                object.array[$i[0]] = $buffer[$start++]
            } while (++$i[0] != 8)

            $start += 8 != $i[0]
                    ? (8 - $i[0]) * 1 - 1
                    : 0

            object.sentry = $buffer[$start++]

            return object
        }
    } ()
}
