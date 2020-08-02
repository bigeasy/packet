module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $i = [], $I = []

            let object = {
                nudge: 0,
                array: [],
                sentry: 0
            }

            object.nudge = (
                $buffer[$start++]
            ) >>> 0

            $I[0] = (() => 8)()

            $i[0] = 0
            do {
                if (
                    $buffer[$start] == 0x0
                ) {
                    $start += 1
                    break
                }

                object.array[$i[0]] = (
                    $buffer[$start++]
                ) >>> 0
            } while (++$i[0] != $I[0])

            $start += $I[0] != $i[0]
                    ? ($I[0] - $i[0]) * 1 - 1
                    : 0

            object.sentry = (
                $buffer[$start++]
            ) >>> 0

            return object
        }
    } ()
}
