module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.all.object = function ($buffer, $start) {
        const object = {
            value: 0
        }

        object.value =
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
