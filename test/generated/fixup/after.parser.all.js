module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.all.object = function ($buffer, $start) {
        const object = {
            value: 0
        }

        object.value =
            ($buffer[$start++]) * 0x100 +
            ($buffer[$start++])

        object.value = (value => value)(object.value)

        return object
    }
}
