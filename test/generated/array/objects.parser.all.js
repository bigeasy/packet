module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $i = [], $I = []

                let object = {
                    array: []
                }

                $I[0] = $buffer[$start++]
                $i[0] = 0

                for (; $i[0] < $I[0]; $i[0]++) {
                    object.array[$i[0]] = {
                        mask: 0,
                        value: 0
                    }

                    object.array[$i[0]].mask =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]

                    object.array[$i[0]].value =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]

                    object.array[$i[0]].value = (($_, $, $i) => $_ ^ $.array[$i[0]].mask)(object.array[$i[0]].value, object, $i)
                }

                return object
            }
        } ()
    }
}
