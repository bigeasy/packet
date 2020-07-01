module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $i = []

            const object = {
                value: [],
                sentry: 0
            }

            $i[0] = 0
            for (;;) {
                object.value[$i[0]] = ($buffer[$start++])
                $i[0]++

                if ($i[0] == 8) {
                    break
                }
            }


            object.value = (function (value) {
                return Buffer.from(value).readDoubleBE()
            })(object.value)

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
