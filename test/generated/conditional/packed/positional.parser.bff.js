module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let $_

                let object = {
                    header: {
                        flag: 0,
                        value: null
                    },
                    sentry: 0
                }

                if ($end - $start < 2) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                $_ = (
                    $buffer[$start++]
                ) >>> 0

                object.header.flag = $_ >>> 6 & 0x3

                if (($ => $.header.flag == 0)(object)) {
                    object.header.value = $_ & 0x3f
                } else if (($ => $.header.flag == 1)(object)) {
                    object.header.value = $_ & 0x3
                } else if (($ => $.header.flag == 2)(object)) {
                    object.header.value = {
                        two: 0,
                        four: 0
                    }

                    object.header.value.two = $_ >>> 4 & 0x3

                    object.header.value.four = $_ & 0xf
                } else {
                    object.header.value = {
                        one: 0,
                        five: 0
                    }

                    object.header.value.one = $_ >>> 5 & 0x1

                    object.header.value.five = $_ & 0x1f
                }

                object.sentry = (
                    $buffer[$start++]
                ) >>> 0

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
