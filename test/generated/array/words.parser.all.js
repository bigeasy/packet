module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

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
