module.exports = function ({ parsers }) {
    parsers.bff.object = function () {
        return function () {
            return function parse ($buffer, $start, $end) {
                let object = {
                    value: 0
                }

                if ($end - $start < 8) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.value =
                    BigInt($buffer[$start++]) +
                    BigInt($buffer[$start++]) * 0x100n +
                    BigInt($buffer[$start++]) * 0x10000n +
                    BigInt($buffer[$start++]) * 0x1000000n +
                    BigInt($buffer[$start++]) * 0x100000000n +
                    BigInt($buffer[$start++]) * 0x10000000000n +
                    BigInt($buffer[$start++]) * 0x1000000000000n +
                    BigInt($buffer[$start++]) * 0x100000000000000n

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
