module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.all.object = function ($buffer, $start) {
        let $_

        const object = {
            value: 0
        }

        $_ =
            ($buffer[$start++]) * 0x100 +
            ($buffer[$start++])
        object.value = $_ & 0x8000 ? (0xffff - $_ + 1) * -1 : $_

        object.value = (value => -value)(object.value)

        return object
    }
}
