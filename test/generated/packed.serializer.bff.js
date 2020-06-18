module.exports = function (serializers) {
    const $Buffer = Buffer

    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            let $_

            if ($end - $start < 4) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0)
                }
            }

            $_ =
                ((0xdeaf << 16 & 0xffff0000) >>> 0) |
                (object.header.one << 15 & 0x8000) |
                (object.header.two << 12 & 0x7000) |
                (object.header.three & 0xfff)

            $buffer[$start++] = ($_ >>> 24 & 0xff)
            $buffer[$start++] = ($_ >>> 16 & 0xff)
            $buffer[$start++] = ($_ >>> 8 & 0xff)
            $buffer[$start++] = ($_ & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
