module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            let $i = []

            const object = {
                value: []
            }

            if ($end - $start < 4) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            $i[0] = 0
            for (;;) {
                object.value[$i[0]] = ($buffer[$start++])
                $i[0]++

                if ($i[0] == 4) {
                    break
                }
            }


            object.value = (function (value) {
                return $from(value).readFloatBE()
            })(object.value)

            return { start: $start, object: object, parse: null }
        }
    }
}
