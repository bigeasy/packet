module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $_, $i = [], $slice = null

                let object = {
                    nudge: 0,
                    array: null,
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1, $i)($buffer, $start, $end)
                }

                object.nudge = (
                    $buffer[$start++]
                ) >>> 0

                if ($end - $start < 8) {
                    return parsers.inc.object(object, 3, $i)($buffer, $start, $end)
                }

                $slice = $buffer.slice($start, $start + 8)
                $start += 8

                $_ = $slice.indexOf(0)
                if (~$_) {
                    $slice = $slice.slice(0, $_)
                }

                object.array = [ $slice ]

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 7, $i)($buffer, $start, $end)
                }

                object.sentry = (
                    $buffer[$start++]
                ) >>> 0

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
