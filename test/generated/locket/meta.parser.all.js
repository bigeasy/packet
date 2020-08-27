module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $_

                let object = {
                    header: {
                        method: 0,
                        index: 0
                    },
                    count: 0,
                    version: 0n
                }

                $_ = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

                object.header.method = $lookup[0][$_ >>> 31 & 0x1]

                object.header.index = $_ & 0x7fffffff

                object.count = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

                object.version =
                    BigInt($buffer[$start++]) << 56n |
                    BigInt($buffer[$start++]) << 48n |
                    BigInt($buffer[$start++]) << 40n |
                    BigInt($buffer[$start++]) << 32n |
                    BigInt($buffer[$start++]) << 24n |
                    BigInt($buffer[$start++]) << 16n |
                    BigInt($buffer[$start++]) << 8n |
                    BigInt($buffer[$start++])

                return object
            }
        } ()
    }
}
