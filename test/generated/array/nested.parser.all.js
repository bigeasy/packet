module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $i = [], $I = []

            let object = {
                array: [],
                sentry: 0
            }

            $I[0] =
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])
            $i[0] = 0

            for (; $i[0] < $I[0]; $i[0]++) {
                object.array[$i[0]] = []

                $I[1] =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
                $i[1] = 0

                for (; $i[1] < $I[1]; $i[1]++) {
                    object.array[$i[0]][$i[1]] =
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])
                }
            }

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
