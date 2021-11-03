module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let object = {
                    value: 0
                }

                object.value =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

                object = (value => value)(object)

                return object
            }
        } ()
    }
}
