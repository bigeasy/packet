module.exports = function (parsers) {
    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            let $i = [], $I = []

            const object = {
                array: [],
                sentry: 0
            }

            if ($end - $start < 2) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            $I[0] =
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])
            $i[0] = 0

            for (; $i[0] < $I[0]; $i[0]++) {
                object.array[$i[0]] = {
                    first: []
                }

                if ($end - $start < 2) {
                    return parsers.inc.object(object, 4, $i, $I)($buffer, $start, $end)
                }

                $I[1] =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
                $i[1] = 0

                if ($end - $start < 2 * $I[1]) {
                    return parsers.inc.object(object, 6, $i, $I)($buffer, $start, $end)
                }

                for (; $i[1] < $I[1]; $i[1]++) {
                    object.array[$i[0]].first[$i[1]] =
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])
                }
            }

            if ($end - $start < 1) {
                return parsers.inc.object(object, 9, $i, $I)($buffer, $start, $end)
            }

            object.sentry = ($buffer[$start++])

            return { start: $start, object: object, parse: null }
        }
    }
}
