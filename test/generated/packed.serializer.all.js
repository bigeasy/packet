module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $buffer, $start) {
                let $_, $$ = []

                $buffer[$start++] = object.nudge & 0xff

                $_ =
                    (0x5eaf << 17 & 0xfffe0000) >>> 0 |
                    object.header.one << 15 & 0x18000 |
                    object.header.two << 12 & 0x7000

                $$[0] = (value => ~value & 0xf)(object.header.three)

                $_ |=
                    $$[0] << 8 & 0xf00

                $_ |=
                    $lookup[0].indexOf(object.header.four) << 6 & 0xc0 |
                    0xaa & 0x3f

                $buffer[$start++] = $_ >>> 24 & 0xff
                $buffer[$start++] = $_ >>> 16 & 0xff
                $buffer[$start++] = $_ >>> 8 & 0xff
                $buffer[$start++] = $_ & 0xff

                $buffer[$start++] = object.sentry & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    }
}
