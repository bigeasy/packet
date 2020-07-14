module.exports = function ({ parsers }) {
    parsers.chk.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let object = {
                    padded: 0,
                    sentry: 0
                }

                if ($end - $start < 8) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                $start += 3

                object.padded =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])

                $start += 3

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 7)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
