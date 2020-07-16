module.exports = function ({ serializers }) {
    serializers.chk.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                let $_

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 0)($buffer, $start, $end)
                }

                $_ =
                    (object.header.type << 6 & 0xc0)

                switch (($ => $.header.type)(object)){
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

                if ($end - $start < 1) {
                    return serializers.inc.object(object, 2)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
