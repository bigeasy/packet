module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $_

                    if ($end - $start < 1) {
                        return $incremental.object(object, 0)($buffer, $start, $end)
                    }

                    $_ =
                        (object.header.flag << 6 & 0xc0)

                    if ((({ $ }) => $.header.flag == 0)({
                        $: object
                    })) {
                        $_ |=
                            (object.header.value & 0x3f)
                    } else if ((({ $ }) => $.header.flag == 1)({
                        $: object
                    })) {
                        $_ |=
                            (0xa << 2 & 0x3c) |
                            (object.header.value & 0x3)
                    } else if ((({ $ }) => $.header.flag == 2)({
                        $: object
                    })) {
                        $_ |=
                            (object.header.value.two << 4 & 0x30) |
                            (object.header.value.four & 0xf)
                    } else {
                        $_ |=
                            (object.header.value.one << 5 & 0x20) |
                            (object.header.value.five & 0x1f)
                    }

                    $buffer[$start++] = $_ & 0xff

                    if ($end - $start < 1) {
                        return $incremental.object(object, 2)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
