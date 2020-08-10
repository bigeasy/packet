module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $_, $2s

                    let object = {
                        nudge: 0,
                        header: {
                            one: 0,
                            two: 0,
                            three: 0,
                            four: 0
                        },
                        sentry: 0
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 1)($buffer, $start, $end)
                    }

                    object.nudge = $buffer[$start++]

                    if ($end - $start < 4) {
                        return $incremental.object(object, 3)($buffer, $start, $end)
                    }

                    $_ = (
                        $buffer[$start++] << 24 |
                        $buffer[$start++] << 16 |
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0

                    object.header.one = $_ >>> 15 & 0x3

                    $2s = $_ >>> 12 & 0x7
                    object.header.two =
                        $2s & 0x4 ? (0x7 - $2s + 1) * -1 : $2s

                    object.header.three = $_ >>> 8 & 0xf

                    object.header.four = $lookup[0][$_ >>> 6 & 0x3]

                    if ($end - $start < 1) {
                        return $incremental.object(object, 5)($buffer, $start, $end)
                    }

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
