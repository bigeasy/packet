module.exports = function (serializers) {
    serializers.inc.object = function (object, $step = 0, $i = []) {
        let $byte, $stop, $_

        return function serialize ($buffer, $start, $end) {
            for (;;) {
                switch ($step) {
                case 0:

                    $step = 1
                    $byte = 1
                    $_ = object.array.length

                case 1:

                    while ($byte != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_ >>> $byte * 8 & 0xff
                        $byte--
                    }

                    $i.push(0)

                case 2:

                    $step = 3
                    $byte = 1
                    $_ = object.array[$i[0]].first.length

                case 3:

                    while ($byte != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_ >>> $byte * 8 & 0xff
                        $byte--
                    }

                    $i.push(0)

                case 4:

                    $step = 5
                    $byte = 1
                    $_ = object.array[$i[0]].first[$i[1]]

                case 5:

                    while ($byte != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_ >>> $byte * 8 & 0xff
                        $byte--
                    }


                    if (++$i[1] != object.array[$i[0]].first.length) {
                        $step = 4
                        continue
                    }

                    $i.pop()

                    if (++$i[0] != object.array.length) {
                        $step = 2
                        continue
                    }

                    $i.pop()

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
