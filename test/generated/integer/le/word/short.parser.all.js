module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.all.object = function ($buffer, $start) {
        const object = {
            value: 0
        }

        object.value =
            ($buffer[$start++]) +
            ($buffer[$start++]) * 0x100

        return object
    }
}
