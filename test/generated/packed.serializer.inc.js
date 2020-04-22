module.exports = function (serializers) {
    serializers.inc.object = function (object, $step = 0, $i = []) {
        let $byte, $stop, $_

        return function serialize ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                $step = 1
                $byte = 3
                $_ =
                     ((0xdeaf << 16 & 0xffff0000) >>> 0) |
                     (object.header.one << 15 & 0x8000) |
                     (object.header.two << 12 & 0x7000) |
                     (object.header.three & 0xfff)

            case 1:

                while ($byte != -1) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = $_ >>> $byte * 8 & 0xff
                    $byte--
                }


                $step = 2

            case 2:

                break

            }

            return { start: $start, serialize: null }
        }
    }
}
