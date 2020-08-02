module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $_

                let object = {
                    value: 0
                }

                if ($end - $start < 4) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                $_ = (
                    $buffer[$start++] |
                    $buffer[$start++] << 8 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 24
                ) >>> 0
                object.value = $_ & 0x80000000 ? (0xffffffff - $_ + 1) * -1 : $_

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
