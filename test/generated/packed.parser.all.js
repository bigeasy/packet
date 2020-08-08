module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $_

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

                object.nudge = $buffer[$start++]

                $_ = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

                object.header.one = $_ >>> 15 & 0x3

                object.header.two = $_ >>> 12 & 0x7
                object.header.two =
                    object.header.two & 0x4 ? (0x7 - object.header.two + 1) * -1 : object.header.two

                object.header.three = $_ >>> 2 & 0x3ff

                object.header.four = $lookup[0][$_ & 0x3]

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
