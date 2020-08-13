module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $i = []

                    if ($end - $start < 1) {
                        return $incremental.object(object, 0, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.type & 0xff

                    switch (($ => $.type)(object)) {
                    case 0:

                        if ($end - $start < 1) {
                            return $incremental.object(object, 3, $i)($buffer, $start, $end)
                        }

                        $buffer[$start++] = object.array.length & 0xff

                        break

                    default:

                        if ($end - $start < 2) {
                            return $incremental.object(object, 5, $i)($buffer, $start, $end)
                        }

                        $buffer[$start++] = object.array.length >>> 8 & 0xff
                        $buffer[$start++] = object.array.length & 0xff

                        break
                    }

                    if ($end - $start < 1 + object.array.length * 1) {
                        return $incremental.object(object, 7, $i)($buffer, $start, $end)
                    }

                    object.array.copy($buffer, $start, 0, object.array.length)
                    $start += object.array.length

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
