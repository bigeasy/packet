module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            const object = {
                value: {
                    first: 0,
                    second: 0
                }
            }

            if ($end - $start < 2) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            object.value.first = ($buffer[$start++])

            object.value.second = ($buffer[$start++])

            return { start: $start, object: object, parse: null }
        }
    }
}
