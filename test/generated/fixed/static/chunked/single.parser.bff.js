module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $_, $i = [], $slice = null

                    let object = {
                        nudge: 0,
                        array: null,
                        sentry: 0
                    }

                    if ($end - $start < 10) {
                        return $incremental.object(object, 1, $i)($buffer, $start, $end)
                    }

                    object.nudge = $buffer[$start++]

                    $slice = $buffer.slice($start, $start + 8)
                    $start += 8

                    $_ = $slice.indexOf(0)
                    if (~$_) {
                        $slice = $slice.slice(0, $_)
                    }

                    object.array = [ $slice ]

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
