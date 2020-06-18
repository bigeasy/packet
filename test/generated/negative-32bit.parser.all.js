module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.all.object = function ($buffer, $start) {
        let $_

        const object = {
            word: 0
        }

        $_ =
            ($buffer[$start++]) * 0x1000000 +
            ($buffer[$start++]) * 0x10000 +
            ($buffer[$start++]) * 0x100 +
            ($buffer[$start++])
        object.word = $_ & 0x80000000 ? (0xffffffff - $_ + 1) * -1 : $_

        return object
    }
}
