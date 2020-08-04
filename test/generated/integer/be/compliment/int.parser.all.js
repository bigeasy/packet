module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $_

                let object = {
                    value: 0
                }

                $_ = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0
                object.value = $_ & 0x80000000 ? (0xffffffff - $_ + 1) * -1 : $_

                return object
            }
        } ()
    }
}
