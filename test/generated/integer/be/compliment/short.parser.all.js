module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.all.object = function ($buffer, $start) {
        let $_

        const object = {
            value: 0
        }

        $_ =
            ($buffer[$start++]) * 0x100 +
            ($buffer[$start++])
        object.value = $_ & 0x8000 ? (0xffff - $_ + 1) * -1 : $_

        return object
    }
}
