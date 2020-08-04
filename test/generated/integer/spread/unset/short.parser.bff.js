module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let object = {
                        nudge: 0,
                        value: 0,
                        sentry: 0
                    }

                    if ($end - $start < 4) {
                        return $incremental.object(object, 1)($buffer, $start, $end)
                    }

                    object.nudge = $buffer[$start++]

                    object.value = (
                        $buffer[$start++] << 7 |
                        $buffer[$start++]
                    ) >>> 0

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
