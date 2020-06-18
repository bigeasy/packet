module.exports = function (parsers) {
    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            const object = {
                type: 0,
                value: 0
            }

            if ($end - $start < 1) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            object.type = ($buffer[$start++])

            switch (($ => $.type)(object)) {
            case 0:

                object.value = ($buffer[$start++])

                break

            case 1:

                object.value =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])

                break

            default:

                object.value =
                    ($buffer[$start++]) * 0x10000 +
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])

                break
            }

            return { start: $start, object: object, parse: null }
        }
    }
}
