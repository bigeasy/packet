module.exports = function (serializers) {
    serializers.inc.object = function (object, $step = 0, $i = []) {
        let $byte, $stop, $_

        return function serialize ($buffer, $start, $end) {
            for (;;) {
                switch ($step) {
                case 0:

                    $i[0] = 0
                    $step = 1

                case 1:

                    $step = 2
                    $byte = 1
                    $_ = object.array[$i[0]]

                case 2:

                    while ($byte != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_ >>> $byte * 8 & 0xff
                        $byte--
                    }

                    if (++$i[0] != object.array.length) {
                        $step = 1
                        continue
                    }

                    $step = 3

                case 3:

                    if ($start == $end) {
                        return { start: $start, serialize }
                    }

                    $buffer[$start++] = 0x0

                    $step = 4

                case 4:

                    if ($start == $end) {
                        return { start: $start, serialize }
                    }

                    $buffer[$start++] = 0x0

                    $step = 5

                    $step = 5

                case 5:

                    break

                }

                break
            }

            return { start: $start, serialize: null }
        }
    }
}
