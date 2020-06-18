module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            const object = {
                padded: 0
            }

            if ($end - $start < 8) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            $start += 3

            object.padded =
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])

            $start += 3

            return { start: $start, object: object, parse: null }
        }
    }
}
