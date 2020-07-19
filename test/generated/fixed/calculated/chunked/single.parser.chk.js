module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $_, $i = [], $I = [], $slice = null

                let object = {
                    nudge: 0,
                    array: null,
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1, $i, $I)($buffer, $start, $end)
                }

                object.nudge = ($buffer[$start++])

                $I[0] = (() => 8)()

                if ($end - $start < $I[0] * 1) {
                    return parsers.inc.object(object, 3, $i, $I)($buffer, $start, $end)
                }

                $slice = $buffer.slice($start, $start + $I[0])
                $start += $I[0]

                $_ = $slice.indexOf(0)
                if (~$_) {
                    $slice = $slice.slice(0, $_)
                }

                object.array = [ $slice ]

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 7, $i, $I)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
