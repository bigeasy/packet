module.exports = function ({ parsers }) {
    parsers.chk.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let object = {
                    type: 0,
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.type = ($buffer[$start++])

                switch (String(($ => $.type)(object))) {
                case "0":

                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 4)($buffer, $start, $end)
                    }

                    object.value = ($buffer[$start++])

                    break

                case "1":

                    if ($end - $start < 2) {
                        return parsers.inc.object(object, 6)($buffer, $start, $end)
                    }

                    object.value =
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])

                    break

                default:

                    if ($end - $start < 3) {
                        return parsers.inc.object(object, 8)($buffer, $start, $end)
                    }

                    object.value =
                        ($buffer[$start++]) * 0x10000 +
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])

                    break
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 10)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
