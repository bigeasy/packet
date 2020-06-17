module.exports = function (parsers) {
    parsers.all.object = function ($buffer, $start) {
        const object = {
            word: 0
        }

        object.word =
            BigInt($buffer[$start++]) * 0x100000000000000n +
            BigInt($buffer[$start++]) * 0x1000000000000n +
            BigInt($buffer[$start++]) * 0x10000000000n +
            BigInt($buffer[$start++]) * 0x100000000n +
            BigInt($buffer[$start++]) * 0x1000000n +
            BigInt($buffer[$start++]) * 0x10000n +
            BigInt($buffer[$start++]) * 0x100n +
            BigInt($buffer[$start++])

        return object
    }
}
