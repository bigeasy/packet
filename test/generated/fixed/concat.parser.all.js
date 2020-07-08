module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $i = []

            let object = {
                array: Buffer.alloc(8),
                sentry: 0
            }

            $i[0] = 0
            for (;;) {
                object.array[$i[0]] = ($buffer[$start++])
                $i[0]++

                if ($i[0] == 8) {
                    break
                }
            }


            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
