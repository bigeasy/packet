module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let object = {
                        value: {
                            first: 0,
                            second: 0
                        },
                        sentry: 0
                    }

                    if ($end - $start < 3) {
                        return $incremental.object(object, 1)($buffer, $start, $end)
                    }

                    object.value.first = $buffer[$start++]

                    object.value.second = $buffer[$start++]

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
