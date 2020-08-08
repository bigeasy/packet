module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let object = {
                    value: 0
                }

                object.value =
                    $buffer[$start++] |
                    $buffer[$start++] << 8

                return object
            }
        } ()
    }
}
