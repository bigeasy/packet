module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $_, $I = []

                let object = {
                    header: {
                        method: 0,
                        count: 0
                    },
                    version: 0n,
                    key: []
                }

                $_ = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

                object.header.method = $lookup[0][$_ >>> 31 & 0x1]

                object.header.count = $_ & 0x7fffffff

                object.version =
                    BigInt($buffer[$start++]) << 56n |
                    BigInt($buffer[$start++]) << 48n |
                    BigInt($buffer[$start++]) << 40n |
                    BigInt($buffer[$start++]) << 32n |
                    BigInt($buffer[$start++]) << 24n |
                    BigInt($buffer[$start++]) << 16n |
                    BigInt($buffer[$start++]) << 8n |
                    BigInt($buffer[$start++])

                $I[0] = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

                object.key = $buffer.slice($start, $start + $I[0])
                $start += $I[0]

                return object
            }
        } ()
    }
}
