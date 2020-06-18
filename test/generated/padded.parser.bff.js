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
                array: []
            }

            if ($end - $start < 16) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            $i[0] = 0
            for (;;) {
                if ($end - $start < 2) {
                    return parsers.inc.object(object, 2, $i)($buffer, $start, $end)
                }

                if (
                    $buffer[$start] == 0xd &&
                    $buffer[$start + 1] == 0xa
                ) {
                    $start += 2
                    break
                }

                object.array[$i[0]] = ($buffer[$start++])
                $i[0]++

                if ($i[0] == 16) {
                    break
                }
            }


            $start += (16 - $i[0]) * 1 - 2

            return { start: $start, object: object, parse: null }
        }
    }
}
