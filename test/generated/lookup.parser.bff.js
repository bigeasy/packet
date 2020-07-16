module.exports = function ({ parsers }) {
    parsers.bff.object = function () {
        const $lookup = {
            "object": {
                "value": [
                    "off",
                    "on"
                ]
            }
        }

        return function () {
            return function ($buffer, $start, $end) {
                let $_

                let object = {
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 2) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                $_ = ($buffer[$start++])

                object.value = $lookup.object.value[$_]

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
