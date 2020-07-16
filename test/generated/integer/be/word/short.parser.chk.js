module.exports = function ({ parsers }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let object = {
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
        } ()
    }
}
