module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let object = {
                        first: 0,
                        second: 0,
                        sentry: 0
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 1)($buffer, $start, $end)
                    }

                    object.first = $buffer[$start++]

                    if ($end - $start < 1) {
                        return $incremental.object(object, 3)($buffer, $start, $end)
                    }

                    object.second = $buffer[$start++]

                    if ($end - $start < 1) {
                        return $incremental.object(object, 5)($buffer, $start, $end)
                    }

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
