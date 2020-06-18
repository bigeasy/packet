module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            const object = {
                value: 0
            }

            if ($end - $start < 2) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            object.value =
                ($buffer[$start++]) +
                ($buffer[$start++]) * 0x100

            return { start: $start, object: object, parse: null }
        }
    }
}
