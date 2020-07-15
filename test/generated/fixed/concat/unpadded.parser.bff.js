module.exports = function ({ parsers }) {
    parsers.bff.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let $_, $i = [], $slice = null

                let object = {
                    array: null,
                    sentry: 0
                }

                if ($end - $start < 9) {
                    return parsers.inc.object(object, 1, $i)($buffer, $start, $end)
                }

                $slice = $buffer.slice($start, 8)
                $start += 8
                object.array = $slice

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
