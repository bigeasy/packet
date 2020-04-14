module.exports = function (serializers) {
    serializers.inc.object = function (object, $step = 0, $i = []) {
        let $byte, $stop, $_

        return function serialize ($buffer, $start, $end) {
            for (;;) {
                switch ($step) {
                case 0:

                    if ((value => value < 251)(object.value, object)) {
                        $step = 1
                        continue
                    } else if ((value => value >= 251)(object.value, object)) {
                        $step = 3
                        continue
                    }

                case 1:

                    $step = 2
                    $byte = 0
                    $_ = object.value

                case 2:

                    while ($byte != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_ >>> $byte * 8 & 0xff
                        $byte--
                    }

                    $step = 7
                    continue

                case 3:

                    $step = 4
                    $byte = 0
                    $_ = [252]

                case 4:

                    while ($byte != 1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_[$byte++]
                    }


                case 5:

                    $step = 6
                    $byte = 1
                    $_ = object.value

                case 6:

                    while ($byte != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_ >>> $byte * 8 & 0xff
                        $byte--
                    }

                    $step = 7

                case 7:

                    break

                }

                break
            }

            return { start: $start, serialize: null }
        }
    }
}
