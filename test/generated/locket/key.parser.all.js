module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let object = {
                    version: 0n
                }

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
