module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $_, $i = [], $slice = null

                let object = {
                    value: null,
                    sentry: 0
                }

                if ($end - $start < 5) {
                    return parsers.inc.object(object, 1, $i)($buffer, $start, $end)
                }

                $slice = $buffer.slice($start, $start + 4)
                $start += 4
                object.value = $slice

                object.value = (function (value) {
                    return value.readFloatLE()
                })(object.value)

                object.sentry = (
                    $buffer[$start++]
                ) >>> 0

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
