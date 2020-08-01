module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                value: 0,
                sentry: 0
            }

            object.value =
                $buffer[$start++] * 0x100 +
                $buffer[$start++]

            object.sentry = $buffer[$start++]

            return object
        }
    } ()
}
