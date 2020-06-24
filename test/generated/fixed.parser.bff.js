module.exports = function ({ parsers }) {
    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            let $i = []

            const object = {
                array: [],
                sentry: 0
            }

            if ($end - $start < 9) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
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

            return { start: $start, object: object, parse: null }
        }
    }
}
