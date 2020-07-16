module.exports = function ({ parsers }) {
    parsers.chk.object = function () {
        return function () {
            return function parse ($buffer, $start, $end) {
                let $i = [], $I = []

                let object = {
                    array: [],
                    sentry: 0
                }

                if ($end - $start < 2) {
                    return parsers.inc.object(object, 1, $i, $I)($buffer, $start, $end)
                }

                $I[0] =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
                $i[0] = 0

                if ($end - $start < 4 * $I[0]) {
                    return parsers.inc.object(object, 3, $i, $I)($buffer, $start, $end)
                }

                for (; $i[0] < $I[0]; $i[0]++) {
                    object.array[$i[0]] = {
                        first: 0,
                        second: 0
                    }

                    object.array[$i[0]].first =
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])

                    object.array[$i[0]].second =
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 8, $i, $I)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}