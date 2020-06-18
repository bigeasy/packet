module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.all.object = function ($buffer, $start) {
        let $_

        const object = {
            value: 0
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

        return object
    }
}
