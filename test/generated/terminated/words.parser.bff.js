module.exports = function ({ parsers }) {
    parsers.bff.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let $i = []

                const object = {
                    array: [],
                    sentry: 0
                }

                $i[0] = 0
                for (;;) {
                    if ($end - $start < 2) {
                        return parsers.inc.object(object, 2, $i)($buffer, $start, $end)
                    }

                    if (
                        $buffer[$start] == 0x0 &&
                        $buffer[$start + 1] == 0x0
                    ) {
                        $start += 2
                        break
                    }

                    if ($end - $start < 2) {
                        return parsers.inc.object(object, 5, $i)($buffer, $start, $end)
                    }

                    object.array[$i[0]] =
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])

                    $i[0]++
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 8, $i)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
