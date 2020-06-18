module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.all.object = function ($buffer, $start) {
        const object = {
            padded: 0
        }

        $start += 3

        object.padded =
            ($buffer[$start++]) * 0x100 +
            ($buffer[$start++])

        $start += 3

        return object
    }
}
