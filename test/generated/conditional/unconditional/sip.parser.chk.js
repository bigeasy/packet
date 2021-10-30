module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $sip = []

                    let object = {
                        nudge: 0,
                        value: 0,
                        sentry: 0
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 1, $sip)($buffer, $start, $end)
                    }

                    object.nudge = $buffer[$start++]

                    if ($end - $start < 2) {
                        return $incremental.object(object, 3, $sip)($buffer, $start, $end)
                    }

                    object.value =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]

                    if ($end - $start < 1) {
                        return $incremental.object(object, 5, $sip)($buffer, $start, $end)
                    }

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
