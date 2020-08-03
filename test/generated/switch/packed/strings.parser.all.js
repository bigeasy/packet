module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $_

            let object = {
                header: {
                    type: 0,
                    value: null
                },
                sentry: 0
            }

            $_ = $buffer[$start++]

            object.header.type = $_ >>> 6 & 0x3

            switch (String(($ => $.header.type)(object))) {
            case "0":
                object.header.value = $_ & 0x3f

                break

            case "1":
                object.header.value = $_ & 0x3

                break

            default:
                object.header.value = {
                    two: 0,
                    four: 0
                }

                object.header.value.two = $_ >>> 4 & 0x3

                object.header.value.four = $_ & 0xf

                break
            }

            object.sentry = $buffer[$start++]

            return object
        }
    } ()
}
