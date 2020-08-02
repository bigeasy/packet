module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                value: 0
            }

            object.value = (
                $buffer[$start++] |
                $buffer[$start++] << 8 |
                $buffer[$start++] << 16 |
                $buffer[$start++] << 24
            ) >>> 0

            return object
        }
    } ()
}
