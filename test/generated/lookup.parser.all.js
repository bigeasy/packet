module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.all.object = function ($buffer, $start) {
        const $lookup = {
            "object": {
                "value": [
                    "off",
                    "on"
                ]
            }
        }

        let $_

        const object = {
            value: 0
        }

        $_ = ($buffer[$start++])

        object.value = $lookup.object.value[$_]

        return object
    }
}
