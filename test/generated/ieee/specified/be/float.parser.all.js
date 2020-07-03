module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $i = []

            let object = {
                value: [],
                sentry: 0
            }

            $i[0] = 0
            for (;;) {
                object.value[$i[0]] = ($buffer[$start++])
                $i[0]++

                if ($i[0] == 4) {
                    break
                }
            }


            object.value = (function (value) {
                return Buffer.from(value).readFloatBE()
            })(object.value)

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
