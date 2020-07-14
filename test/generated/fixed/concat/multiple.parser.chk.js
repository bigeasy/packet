module.exports = function ({ parsers }) {
    parsers.chk.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let $_, $i = [], $slice = null

                let object = {
                    array: Buffer.alloc(8),
                    sentry: 0
                }

                if ($end - $start < 8) {
                    return parsers.inc.object(object, 1, $i)($buffer, $start, $end)
                }

                $slice = $buffer.slice($start, 8)
                $start += 8

                $_ = $slice.indexOf(Buffer.from([ 10, 11 ]))
                if (~$_) {
                    $slice = $buffer.slice(0, $_)
                }

                object.array = $slice

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 6, $i)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
