module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.all.object = function ($buffer, $start) {
        const object = {
            word: 0
        }

        object.word =
            ($buffer[$start++]) +
            ($buffer[$start++]) * 0x100 +
            ($buffer[$start++]) * 0x10000 +
            ($buffer[$start++]) * 0x1000000

        return object
    }
}
