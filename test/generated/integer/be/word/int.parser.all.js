module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                value: 0
            }

            object.value = (
                $buffer[$start++] << 24 |
                $buffer[$start++] << 16 |
                $buffer[$start++] << 8 |
                $buffer[$start++]
            ) >>> 0

            return object
        }
    } ()
}
