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
                object.array[$i[0]] =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
                $i[0]++

                if ($i[0] == 4) {
                    break
                }
            }


            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
