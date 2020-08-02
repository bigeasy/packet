module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                value: 0,
                sentry: 0
            }

            object.value = (
                $buffer[$start++] << 8 |
                $buffer[$start++]
            ) >>> 0

            object.sentry = (
                $buffer[$start++]
            ) >>> 0

            return object
        }
    } ()
}
