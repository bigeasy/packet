module.exports = function ({ $lookup }) {
    return {
        object: function () {
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
                        $buffer[$start] == 0xd &&
                        $buffer[$start + 1] == 0xa
                    ) {
                        $start += 2
                        break
                    }

                    object.array[$i[0]] = $buffer[$start++]
                } while (++$i[0] != 16)

                $start += 16 != $i[0]
                        ? (16 - $i[0]) * 1 - 2
                        : 0

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
