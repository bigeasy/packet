module.exports = function (serializers) {
    serializers.inc.object = function (object, $step = 0, $i = []) {
        let $bite, $stop, $_

        return function serialize ($buffer, $start, $end) {
            for (;;) {
                switch ($step) {
                case 0:

                    $i[0] = 0
                    $step = 1
                case 1:

                    $step = 2
                    $bite = 0
                    $_ = object.array[$i[0]]

                case 2:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                        $bite--
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

                    if ($i[0]++ == 16) {
                        $step = 5
                        continue
                    }

                    $buffer[$start++] = 0xd

                    $step = 4

                case 4:

                    if ($start == $end) {
                        return { start: $start, serialize }
                    }

                    if ($i[0]++ == 16) {
                        $step = 5
                        continue
                    }

                    $buffer[$start++] = 0xa

                    $step = 5

                    if ($i[0] != 16) {
                        $step = 3
                        continue
                    }

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
