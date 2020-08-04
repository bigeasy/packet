module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $_

                    let object = {
                        value: 0
                    }

                    if ($end - $start < 2) {
                        return $incremental.object(object, 1)($buffer, $start, $end)
                    }

                    $_ = (
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0
                    object.value = $_ & 0x8000 ? (0xffff - $_ + 1) * -1 : $_

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
