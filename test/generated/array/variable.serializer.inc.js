module.exports = function (serializers) {
    serializers.inc.object = function (object, $step = 0, $i = []) {
        let $bite, $stop, $_

        return function serialize ($buffer, $start, $end) {
            for (;;) {
                switch ($step) {
                case 0:

                    $step = 1
                    $bite = 1
                    $_ = object.array.length

                case 1:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }

                    $i[0] = 0

                case 2:

                    $step = 3
                    $bite = 1
                    $_ = object.array[$i[0]].first.length

                case 3:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }

                    $i[1] = 0

                case 4:

                    $step = 5
                    $bite = 1
                    $_ = object.array[$i[0]].first[$i[1]]

                case 5:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }


                    if (++$i[1] != object.array[$i[0]].first.length) {
                        $step = 4
                        continue
                    }

                    if (++$i[0] != object.array.length) {
                        $step = 2
                        continue
                    }

                    $step = 6

                case 6:

                    break

                }

                break
            }

            return { start: $start, serialize: null }
        }
    }
}
