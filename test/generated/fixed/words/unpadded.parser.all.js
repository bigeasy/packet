module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $i = []

            let object = {
                array: [],
                sentry: []
            }

            $i[0] = 0
            for (;;) {
                object.array[$i[0]] =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
                $i[0]++

                if ($i[0] == 4) {
                    break
                }
            }


            $i[0] = 0
            for (;;) {
                if (
                    $buffer[$start] == 0x0
                ) {
                    $start += 1
                    break
                }

                object.sentry[$i[0]] = ($buffer[$start++])

                $i[0]++
            }

            return object
        }
    } ()
}
