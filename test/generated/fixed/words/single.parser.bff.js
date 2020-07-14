module.exports = function ({ parsers }) {
    parsers.bff.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let $i = []

                let object = {
                    array: [],
                    sentry: 0
                }

                if ($end - $start < 9) {
                    return parsers.inc.object(object, 1, $i)($buffer, $start, $end)
                }

                $i[0] = 0
                for (;;) {
                    if ($end - ($start - undefined) < 1) {
                        return parsers.inc.object(object, 2, $i)($buffer, $start - undefined, $end)
                    }

                    if (
                        $buffer[$start] == 0x0
                    ) {
                        $start += 1
                        break
                    }

                    object.array[$i[0]] = ($buffer[$start++])
                    $i[0]++

                    if ($i[0] == 8) {
                        break
                    }
                }


                $start += 8 != $i[0]
                        ? (8 - $i[0]) * 1 - 1
                        : 0

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
