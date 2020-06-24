module.exports = function ({ parsers }) {
    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            let $i = []

            const object = {
                value: [],
                sentry: 0
            }

            if ($end - $start < 5) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
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

            return { start: $start, object: object, parse: null }
        }
    }
}
