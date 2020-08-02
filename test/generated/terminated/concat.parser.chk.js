module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $_, $i = []

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

                $_ = $buffer.indexOf(Buffer.from([ 13, 10 ]), $start)
                if (~$_) {
                    object.array = $buffer.slice($start, $_)
                    $start = $_ + 2
                } else {
                    return parsers.inc.object(object, 3, $i)($buffer, $start, $end)
                }

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
