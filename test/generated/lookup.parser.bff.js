module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $_

                    let object = {
                        nudge: 0,
                        value: 0,
                        yn: 0,
                        binary: 0,
                        mapped: 0,
                        sentry: 0
                    }

                    if ($end - $start < 6) {
                        return $incremental.object(object, 1)($buffer, $start, $end)
                    }

                    object.nudge = $buffer[$start++]

                    $_ = $buffer[$start++]

                    object.value = $lookup[0][$_]

                    $_ = $buffer[$start++]

                    object.yn = $lookup[1][$_]

                    $_ = $buffer[$start++]

                    object.binary = $lookup[0][$_]

                    $_ = $buffer[$start++]

                    object.mapped = $lookup[2].forward[$_]

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
