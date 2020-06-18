module.exports = function (parsers) {
    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            let $i = []

            const object = {
                array: []
            }

            if ($end - $start < 8) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            $i[0] = 0
            for (;;) {
                object.array[$i[0]] =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
                $i[0]++

                if ($i[0] == 4) {
                    break
                }
            }


            return { start: $start, object: object, parse: null }
        }
    }
}
