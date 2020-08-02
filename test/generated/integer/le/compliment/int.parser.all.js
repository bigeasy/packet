module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $_

            let object = {
                value: 0
            }

            $_ = (
                $buffer[$start++] |
                $buffer[$start++] << 8 |
                $buffer[$start++] << 16 |
                $buffer[$start++] << 24
            ) >>> 0
            object.value = $_ & 0x80000000 ? (0xffffffff - $_ + 1) * -1 : $_

            return object
        }
    } ()
}
