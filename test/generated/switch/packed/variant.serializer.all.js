module.exports = function ({ serializers, $lookup }) {
    serializers.all.object = function () {
        return function (object, $buffer, $start) {
            let $_

            $_ =
                (object.header.type << 6 & 0xc0)

            switch (($ => $.header.type)(object)) {
            case 0:

                $_ |=
                    (object.header.value & 0x3f)

                break

            case 1:

                $_ |=
                    (0xa << 2 & 0x3c) |
                    (object.header.value & 0x3)

                break

            default:

                $_ |=
                    (object.header.value.two << 4 & 0x30) |
                    (object.header.value.four & 0xf)

                break
            }

            $buffer[$start++] = $_ & 0xff

            $buffer[$start++] = object.sentry & 0xff

            return { start: $start, serialize: null }
        }
    } ()
}
