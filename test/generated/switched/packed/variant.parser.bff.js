module.exports = function ({ parsers }) {
    parsers.bff.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let $_

                let object = {
                    header: {
                        type: 0,
                        value: 0
                    },
                    sentry: 0
                }

                if ($end - $start < 2) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                $_ = ($buffer[$start++])

                object.header.type = $_ >>> 6 & 0x3

                switch (($ => $.header.type)(object)) {
                case 0:
                    object.header.value = $_ & 0x3f

                    break

                case 1:
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

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
