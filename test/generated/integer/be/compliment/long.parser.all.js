module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $_

            let object = {
                value: 0
            }

            $_ =
                (BigInt($buffer[$start++]) << 56n) +
                (BigInt($buffer[$start++]) << 48n) +
                (BigInt($buffer[$start++]) << 40n) +
                (BigInt($buffer[$start++]) << 32n) +
                (BigInt($buffer[$start++]) << 24n) +
                (BigInt($buffer[$start++]) << 16n) +
                (BigInt($buffer[$start++]) << 8n) +
                BigInt($buffer[$start++])
            object.value = $_ & 0x8000000000000000n ? (0xffffffffffffffffn - $_ + 1n) * -1n : $_

            return object
        }
    } ()
}
