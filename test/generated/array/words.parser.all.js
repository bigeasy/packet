module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.all.object = function ($buffer, $start) {
        const object = {
            value: {
                first: 0,
                second: 0
            }
        }

        object.value.first = ($buffer[$start++])

        object.value.second = ($buffer[$start++])

        return object
    }
}
