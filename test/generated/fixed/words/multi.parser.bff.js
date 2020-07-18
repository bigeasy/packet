module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $i = []

                let object = {
                    nudge: 0,
                    array: [],
                    sentry: 0
                }

                if ($end - $start < 18) {
                    return parsers.inc.object(object, 1, $i)($buffer, $start, $end)
                }

                object.nudge = ($buffer[$start++])

                $i[0] = 0
                for (;;) {
                    if ($end - ($start - undefined) < 2) {
                        return parsers.inc.object(object, 4, $i)($buffer, $start - undefined, $end)
                    }

                    if (
                        $buffer[$start] == 0xd &&
                        $buffer[$start + 1] == 0xa
                    ) {
                        $start += 2
                        break
                    }

                    object.array[$i[0]] = ($buffer[$start++])
                    $i[0]++

                    if ($i[0] == 16) {
                        break
                    }
                }


                $start += 16 != $i[0]
                        ? (16 - $i[0]) * 1 - 2
                        : 0

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
