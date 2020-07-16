module.exports = function ({ parsers }) {
    parsers.chk.object = function () {
        const $lookup = {
            "object": {
                "value": [
                    "off",
                    "on"
                ]
            }
        }

        return function () {
            return function parse ($buffer, $start, $end) {
                let $_

                let object = {
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                $_ = ($buffer[$start++])

                object.value = $lookup.object.value[$_]

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 3)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
