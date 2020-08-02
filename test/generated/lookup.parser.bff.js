module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
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
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.nudge = (
                    $buffer[$start++]
                ) >>> 0

                $_ = (
                    $buffer[$start++]
                ) >>> 0

                object.value = $lookup[0][$_]

                $_ = (
                    $buffer[$start++]
                ) >>> 0

                object.yn = $lookup[1][$_]

                $_ = (
                    $buffer[$start++]
                ) >>> 0

                object.binary = $lookup[0][$_]

                $_ = (
                    $buffer[$start++]
                ) >>> 0

                object.mapped = $lookup[2].forward[$_]

                object.sentry = (
                    $buffer[$start++]
                ) >>> 0

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
