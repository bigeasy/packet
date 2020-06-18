module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.all.object = function ($buffer, $start) {
        const object = {
            padded: 0
        }

        $start += 6

        object.padded =
            ($buffer[$start++]) * 0x100 +
            ($buffer[$start++])

        $start += 6

        return object
    }
}
