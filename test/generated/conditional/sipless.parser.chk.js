module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let object = {
                    type: 0,
                    value: 0,
                    sentry: 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.type = (
                    $buffer[$start++]
                ) >>> 0

                if (($ => $.type == 0)(object)) {
                    if ($end - $start < 2) {
                        return parsers.inc.object(object, 4)($buffer, $start, $end)
                    }

                    object.value = (
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0
                } else if (($ => $.type == 1)(object)) {
                    if ($end - $start < 3) {
                        return parsers.inc.object(object, 6)($buffer, $start, $end)
                    }

                    object.value = (
                        $buffer[$start++] << 16 |
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0
                } else {
                    if ($end - $start < 4) {
                        return parsers.inc.object(object, 8)($buffer, $start, $end)
                    }

                    object.value = (
                        $buffer[$start++] << 24 |
                        $buffer[$start++] << 16 |
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0
                }

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 10)($buffer, $start, $end)
                }

                object.sentry = (
                    $buffer[$start++]
                ) >>> 0

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
