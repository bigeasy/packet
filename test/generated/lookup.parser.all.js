module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $_

                let object = {
                    nudge: 0,
                    value: 0,
                    yn: 0,
                    binary: 0,
                    mapped: 0,
                    sentry: 0
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

                return object
            }
        } ()
    }
}
