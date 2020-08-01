module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $_

                let object = {
                    header: {
                        one: 0,
                        two: 0,
                        three: 0
                    },
                    sentry: 0
                }

                if ($end - $start < 5) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                $_ =
                    $buffer[$start++] * 0x1000000 +
                    $buffer[$start++] * 0x10000 +
                    $buffer[$start++] * 0x100 +
                    $buffer[$start++]

                object.header.one = $_ >>> 15 & 0x3

                object.header.two = $_ >>> 12 & 0x7
                object.header.two =
                    object.header.two & 0x4 ? (0x7 - object.header.two + 1) * -1 : object.header.two

                object.header.three = $_ & 0xfff

                object.sentry = $buffer[$start++]

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
