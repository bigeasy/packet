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
                object.array[$i[0]] =
                    $buffer[$start++] * 0x100 +
                    $buffer[$start++]
            } while (++$i[0] != 4)

            object.sentry = $buffer[$start++]

            return object
        }
    } ()
}
