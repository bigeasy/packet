module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $_

                let object = {
                    value: 0,
                    sentry: 0
                }

                $_ = (
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0
                object.value = $_ & 0x8000 ? (0xffff - $_ + 1) * -1 : $_

                object.value = (value => -value)(object.value)

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
