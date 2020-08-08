module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $_

                let object = {
                    nudge: 0,
                    value: 0n,
                    sentry: 0
                }

                object.nudge = $buffer[$start++]

                $_ =
                    BigInt($buffer[$start++]) << 56n |
                    BigInt($buffer[$start++]) << 48n |
                    BigInt($buffer[$start++]) << 40n |
                    BigInt($buffer[$start++]) << 32n |
                    BigInt($buffer[$start++]) << 24n |
                    BigInt($buffer[$start++]) << 16n |
                    BigInt($buffer[$start++]) << 8n |
                    BigInt($buffer[$start++])

                object.value = $_ & 0x8000000000000000n ? (0xffffffffffffffffn - $_ + 1n) * -1n : $_

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
