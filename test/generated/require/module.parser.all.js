module.exports = function ({ $lookup }) {
    return {
        object: function () {
            const twiddle = require('../../cycle/twiddle')

            return function ($buffer, $start) {
                let object = {
                    value: 0,
                    sentry: 0
                }

                object.value = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

                object.value = (value => twiddle(value))(object.value)

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
