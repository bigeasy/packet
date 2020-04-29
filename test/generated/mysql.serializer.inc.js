module.exports = function (serializers) {
    serializers.inc.object = function (object, $step = 0, $i = []) {
        let $bite, $stop, $_

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
                    $bite = 0
                    $_ = object.value

                case 2:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                        $bite--
                    }

                    $step = 7
                    continue

                case 3:

                    $step = 4
                    $bite = 0
                    $_ = [252]

                case 4:

                    while ($bite != 1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_[$bite++]
                    }


                case 5:

                    $step = 6
                    $bite = 1
                    $_ = object.value

                case 6:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                        $bite--
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
