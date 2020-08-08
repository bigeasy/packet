module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $_

                    if ($end - $start < 1) {
                        return $incremental.object(object, 0)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    if ($end - $start < 4) {
                        return $incremental.object(object, 2)($buffer, $start, $end)
                    }

                    $_ =
                        (0x5eaf << 17 & 0xfffe0000) >>> 0 |
                        object.header.one << 15 & 0x18000 |
                        object.header.two << 12 & 0x7000 |
                        object.header.three << 2 & 0xffc |
                        $lookup[0].indexOf(object.header.four) & 0x3

                    $buffer[$start++] = $_ >>> 24 & 0xff
                    $buffer[$start++] = $_ >>> 16 & 0xff
                    $buffer[$start++] = $_ >>> 8 & 0xff
                    $buffer[$start++] = $_ & 0xff

                    if ($end - $start < 1) {
                        return $incremental.object(object, 4)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
