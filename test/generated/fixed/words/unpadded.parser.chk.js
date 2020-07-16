module.exports = function ({ parsers }) {
    parsers.chk.object = function () {
        return function () {
            return function parse ($buffer, $start, $end) {
                let $i = []

                let object = {
                    array: [],
                    sentry: 0
                }

                if ($end - $start < 8) {
                    return parsers.inc.object(object, 1, $i)($buffer, $start, $end)
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


                if ($end - $start < 1) {
                    return parsers.inc.object(object, 6, $i)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
