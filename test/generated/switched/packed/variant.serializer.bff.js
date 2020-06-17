module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            let $_

            if ($end - $start < 1) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0)
                }
            }

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

            $buffer[$start++] = ($_ & 0xff)

            return { start: $start, serialize: null }
        }
    }
}
