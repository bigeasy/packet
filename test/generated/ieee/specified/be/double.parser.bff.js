module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            let $i = []

            const object = {
                value: []
            }

            if ($end - $start < 8) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            $i[0] = 0
            for (;;) {
                object.value[$i[0]] = ($buffer[$start++])
                $i[0]++

                if ($i[0] == 8) {
                    break
                }
            }


            object.value = (function (value) {
                return $Buffer.from(value).readDoubleBE()
            })(object.value)

            return { start: $start, object: object, parse: null }
        }
    }
}
