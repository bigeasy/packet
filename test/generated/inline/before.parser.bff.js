module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let object = {
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 3) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.value = (
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

                object.sentry = $buffer[$start++]

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
