module.exports = function ({ parsers }) {
    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            const object = {
                value: 0
            }

            if ($end - $start < 2) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            object.value =
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])

            return { start: $start, object: object, parse: null }
        }
    }
}
