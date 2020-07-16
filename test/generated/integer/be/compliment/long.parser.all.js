module.exports = function ({ parsers }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $_

            let object = {
                value: 0
            }

            $_ =
                BigInt($buffer[$start++]) * 0x100000000000000n +
                BigInt($buffer[$start++]) * 0x1000000000000n +
                BigInt($buffer[$start++]) * 0x10000000000n +
                BigInt($buffer[$start++]) * 0x100000000n +
                BigInt($buffer[$start++]) * 0x1000000n +
                BigInt($buffer[$start++]) * 0x10000n +
                BigInt($buffer[$start++]) * 0x100n +
                BigInt($buffer[$start++])
            object.value = $_ & 0x8000000000000000n ? (0xffffffffffffffffn - $_ + 1n) * -1n : $_

            return object
        }
    } ()
}
