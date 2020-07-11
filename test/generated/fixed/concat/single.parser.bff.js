module.exports = function ({ parsers }) {
    parsers.bff.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let $_, $i = [], $slice = null

                let object = {
                    array: Buffer.alloc(8),
                    sentry: []
                }

                if ($end - $start < 8) {
                    return parsers.inc.object(object, 1, $i)($buffer, $start, $end)
                }

                $slice = $buffer.slice($start, 8)
                $start += 8

                $_ = $slice.indexOf(0)
                if (~$_) {
                    $slice = $buffer.slice(0, $_)
                }

                object.array = $slice

                $i[0] = 0
                for (;;) {
                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 6, $i)($buffer, $start, $end)
                    }

                    if (
                        $buffer[$start] == 0x0
                    ) {
                        $start += 1
                        break
                    }

                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 8, $i)($buffer, $start, $end)
                    }

                    object.sentry[$i[0]] = ($buffer[$start++])

                    $i[0]++
                }

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
