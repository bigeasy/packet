module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $i = [], $I = []

                let object = {
                    nudge: 0,
                    array: [],
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1, $i, $I)($buffer, $start, $end)
                }

                object.nudge = ($buffer[$start++])

                $I[0] = (() => 4)()

                if ($end - $start < $I[0] * 2) {
                    return parsers.inc.object(object, 3, $i, $I)($buffer, $start, $end)
                }

                $i[0] = 0
                do {
                    if ($end - $start < 2) {
                        return parsers.inc.object(object, 5, $i, $I)($buffer, $start, $end)
                    }

                    object.array[$i[0]] =
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])
                } while (++$i[0] != $I[0])

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 8, $i, $I)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
