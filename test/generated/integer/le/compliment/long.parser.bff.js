module.exports = function ({ parsers }) {
    parsers.bff.object = function () {
        return function () {
            return function parse ($buffer, $start, $end) {
                let $_

                let object = {
                    value: 0
                }

                if ($end - $start < 8) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                $_ =
                    BigInt($buffer[$start++]) +
                    BigInt($buffer[$start++]) * 0x100n +
                    BigInt($buffer[$start++]) * 0x10000n +
                    BigInt($buffer[$start++]) * 0x1000000n +
                    BigInt($buffer[$start++]) * 0x100000000n +
                    BigInt($buffer[$start++]) * 0x10000000000n +
                    BigInt($buffer[$start++]) * 0x1000000000000n +
                    BigInt($buffer[$start++]) * 0x100000000000000n
                object.value = $_ & 0x8000000000000000n ? (0xffffffffffffffffn - $_ + 1n) * -1n : $_

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
