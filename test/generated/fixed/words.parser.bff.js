module.exports = function ({ parsers }) {
    parsers.bff.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let $i = []

                let object = {
                    array: [],
                    sentry: []
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


                $i[0] = 0
                for (;;) {
                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 9, $i)($buffer, $start, $end)
                    }

                    if (
                        $buffer[$start] == 0x0
                    ) {
                        $start += 1
                        break
                    }

                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 11, $i)($buffer, $start, $end)
                    }

                    object.sentry[$i[0]] = ($buffer[$start++])

                    $i[0]++
                }

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
