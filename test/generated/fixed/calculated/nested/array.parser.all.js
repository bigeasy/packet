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

            $I[0] = (() => 2)()

            $i[0] = 0
            do {
                object.array[$i[0]] = []

                $I[1] = (
                    $buffer[$start++]
                ) >>> 0
                $i[1] = 0

                for (; $i[1] < $I[1]; $i[1]++) {
                    object.array[$i[0]][$i[1]] = (
                        $buffer[$start++]
                    ) >>> 0
                }
            } while (++$i[0] != $I[0])

            object.sentry = (
                $buffer[$start++]
            ) >>> 0

            return object
        }
    } ()
}
