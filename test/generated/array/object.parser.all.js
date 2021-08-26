module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $i = [], $I = []

                let object = {
                    array: []
                }

                $I[0] =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                $i[0] = 0

                for (; $i[0] < $I[0]; $i[0]++) {
                    object.array[$i[0]] = {
                        value: 0
                    }

                    object.array[$i[0]].value =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                }

                return object
            }
        } ()
    }
}
