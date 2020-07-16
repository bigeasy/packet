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
                    $buffer[$start] == 0x0
                ) {
                    $start += 1
                    break
                }

                object.array[$i[0]] = ($buffer[$start++])
                $i[0]++

                if ($i[0] == 8) {
                    break
                }
            }


            $start += 8 != $i[0]
                    ? (8 - $i[0]) * 1 - 1
                    : 0

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
