module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $_

            let object = {
                header: {
                    one: 0,
                    two: 0,
                    three: 0
                },
                sentry: 0
            }

            $_ =
                ($buffer[$start++]) * 0x1000000 +
                ($buffer[$start++]) * 0x10000 +
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])

            object.header.one = $_ >>> 15 & 0x3

            object.header.two = $_ >>> 12 & 0x7
            object.header.two =
                object.header.two & 0x4 ? (0x7 - object.header.two + 1) * -1 : object.header.two

            object.header.three = $_ & 0xfff

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
