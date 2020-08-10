module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $_

                    if ($end - $start < 6) {
                        return $incremental.object(object, 0)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    $_ =
                        (0x5eaf << 17 & 0xfffe0000) >>> 0 |
                        object.header.one << 15 & 0x18000 |
                        object.header.two << 12 & 0x7000 |
                        object.header.three << 8 & 0xf00 |
                        $lookup[0].indexOf(object.header.four) << 6 & 0xc0 |
                        0xaa & 0x3f

                    $buffer[$start++] = $_ >>> 24 & 0xff
                    $buffer[$start++] = $_ >>> 16 & 0xff
                    $buffer[$start++] = $_ >>> 8 & 0xff
                    $buffer[$start++] = $_ & 0xff

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
