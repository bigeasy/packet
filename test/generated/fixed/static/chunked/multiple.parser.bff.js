module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $_, $i = [], $slice = null

                let object = {
                    nudge: 0,
                    array: null,
                    sentry: 0
                }

                if ($end - $start < 10) {
                    return parsers.inc.object(object, 1, $i)($buffer, $start, $end)
                }

                object.nudge = (
                    $buffer[$start++]
                ) >>> 0

                $slice = $buffer.slice($start, $start + 8)
                $start += 8

                $_ = $slice.indexOf(Buffer.from([ 13, 10 ]))
                if (~$_) {
                    $slice = $slice.slice(0, $_)
                }

                object.array = [ $slice ]

                object.sentry = (
                    $buffer[$start++]
                ) >>> 0

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
