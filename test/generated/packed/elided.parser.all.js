module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $_, $2s

                let object = {
                    nudge: 0,
                    one: 0,
                    two: 0,
                    three: 0,
                    four: 0,
                    sentry: 0
                }

                object.nudge = $buffer[$start++]

                $_ = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

                object.one = $_ >>> 15 & 0x3

                $2s = $_ >>> 12 & 0x7
                object.two =
                    $2s & 0x4 ? (0x7 - $2s + 1) * -1 : $2s

                object.three = $_ >>> 11 & 0x1

                object.three = (value => value)(object.three)

                object.four = $lookup[0][$_ >>> 6 & 0x1f]

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
