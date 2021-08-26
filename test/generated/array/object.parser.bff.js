module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $i = [], $I = []

                    let object = {
                        array: []
                    }

                    if ($end - $start < 2) {
                        return $incremental.object(object, 1, $i, $I)($buffer, $start, $end)
                    }

                    $I[0] =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    $i[0] = 0

                    if ($end - $start < 2 * $I[0]) {
                        return $incremental.object(object, 3, $i, $I)($buffer, $start, $end)
                    }

                    for (; $i[0] < $I[0]; $i[0]++) {
                        object.array[$i[0]] = {
                            value: 0
                        }

                        object.array[$i[0]].value =
                            $buffer[$start++] << 8 |
                            $buffer[$start++]
                    }

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
