module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let object = {
                    value: 0
                }

                if ($end - $start < 2) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.value = (
                    $buffer[$start++] |
                    $buffer[$start++] << 8
                ) >>> 0

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
