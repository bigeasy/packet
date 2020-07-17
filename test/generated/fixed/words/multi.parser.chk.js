module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $i = []

                let object = {
                    array: [],
                    sentry: 0
                }

                if ($end - $start < 16) {
                    return parsers.inc.object(object, 1, $i)($buffer, $start, $end)
                }

                $i[0] = 0
                for (;;) {
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

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 10, $i)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
