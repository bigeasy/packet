module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $i = []

                    if ($end - $start < 2) {
                        return $incremental.object(object, 0, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.array.length >>> 8 & 0xff
                    $buffer[$start++] = object.array.length & 0xff
                    $i[0] = 0

                    for (; $i[0] < object.array.length; $i[0]++) {
                        if ($end - $start < 2) {
                            return $incremental.object(object, 3, $i)($buffer, $start, $end)
                        }

                        $buffer[$start++] = object.array[$i[0]].value >>> 8 & 0xff
                        $buffer[$start++] = object.array[$i[0]].value & 0xff
                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
