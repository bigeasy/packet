module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $I = []

                    let object = {
                        type: 0,
                        array: [],
                        sentry: 0
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 1, $I)($buffer, $start, $end)
                    }

                    object.type = $buffer[$start++]

                    switch (($ => $.type)(object)) {
                    case 0:
                        if ($end - $start < 1) {
                            return $incremental.object(object, 4, $I)($buffer, $start, $end)
                        }

                        $I[0] = $buffer[$start++]

                        break

                    default:
                        if ($end - $start < 2) {
                            return $incremental.object(object, 6, $I)($buffer, $start, $end)
                        }

                        $I[0] =
                            $buffer[$start++] << 8 |
                            $buffer[$start++]

                        break
                    }

                    if ($end - $start < 1 + 1 * $I[0]) {
                        return $incremental.object(object, 8, $I)($buffer, $start, $end)
                    }

                    object.array = $buffer.slice($start, $start + $I[0])
                    $start += $I[0]

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
