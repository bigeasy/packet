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
                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 2, $i)($buffer, $start, $end)
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

                $i[0] = 0
                for (;;) {
                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 10, $i)($buffer, $start, $end)
                    }

                    if (
                        $buffer[$start] == 0x0
                    ) {
                        $start += 1
                        break
                    }

                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 12, $i)($buffer, $start, $end)
                    }

                    object.sentry[$i[0]] = ($buffer[$start++])

                    $i[0]++
                }

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
