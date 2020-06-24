module.exports = function ({ parsers }) {
    parsers.all.object = function ($buffer, $start) {
        let $_

        const object = {
            header: {
                flag: 0,
                value: 0
            },
            sentry: 0
        }

        $_ = ($buffer[$start++])

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

        object.sentry = ($buffer[$start++])

        return object
    }
}
