module.exports = function ({ parsers }) {
    parsers.bff.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let $i = []

                let object = {
                    value: [],
                    sentry: 0
                }

                if ($end - $start < 9) {
                    return parsers.inc.object(object, 1, $i)($buffer, $start, $end)
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
                    return Buffer.from(value).readDoubleLE()
                })(object.value)

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
