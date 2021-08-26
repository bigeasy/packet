module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $i = [], $$ = []

                    if ($end - $start < 1 + object.array.length * 4) {
                        return $incremental.object(object, 0, $i, $$)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.array.length & 0xff
                    $i[0] = 0

                    for (; $i[0] < object.array.length; $i[0]++) {
                        $buffer[$start++] = object.array[$i[0]].mask >>> 8 & 0xff
                        $buffer[$start++] = object.array[$i[0]].mask & 0xff

                        $$[0] = (($_, $, $i) => $_ ^ $.array[$i[0]].mask)(object.array[$i[0]].value, object, $i)

                        $buffer[$start++] = $$[0] >>> 8 & 0xff
                        $buffer[$start++] = $$[0] & 0xff
                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
