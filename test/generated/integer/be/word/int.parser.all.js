module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.all.object = function ($buffer, $start) {
        const object = {
            value: 0
        }

        object.value =
            ($buffer[$start++]) * 0x1000000 +
            ($buffer[$start++]) * 0x10000 +
            ($buffer[$start++]) * 0x100 +
            ($buffer[$start++])

        return object
    }
}
