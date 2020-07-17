module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $_

            let object = {
                value: 0
            }

            $_ =
                ($buffer[$start++]) +
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++]) * 0x10000 +
                ($buffer[$start++]) * 0x1000000
            object.value = $_ & 0x80000000 ? (0xffffffff - $_ + 1) * -1 : $_

            return object
        }
    } ()
}
