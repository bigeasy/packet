module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $i = []

            let object = {
                array: [],
                sentry: 0
            }

            $i[0] = 0
            for (;;) {
                if (
                    $buffer[$start] == 0x0 &&
                    $buffer[$start + 1] == 0x0
                ) {
                    $start += 2
                    break
                }

                object.array[$i[0]] = []

                $i[1] = 0
                for (;;) {
                    if (
                        $buffer[$start] == 0x0 &&
                        $buffer[$start + 1] == 0x0
                    ) {
                        $start += 2
                        break
                    }

                    object.array[$i[0]][$i[1]] =
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])

                    $i[1]++
                }

                $i[0]++
            }

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
