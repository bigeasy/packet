module.exports = function (serializers) {
    serializers.inc.object = function (object, $step, $i) {
        let $bite, $stop, $_

        return function serialize ($buffer, $start, $end) {
            SERIALIZE: for (;;) {
                switch ($step) {
                case 0:

                    $step = 1
                    $bite = 1
                    $_ = object.values.length

                case 1:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                        $bite--
                    }

                    $i.push(0)

                case 2:

                    $step = 3
                    $bite = 1
                    $_ = object.values[$i[0]].key

                case 3:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                        $bite--
                    }


                case 4:

                    $step = 5
                    $bite = 1
                    $_ = object.values[$i[0]].value

                case 5:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                        $bite--
                    }


                    if (++$i[0] != object.values.length) {
                        $step = 2
                        continue SERIALIZE
                    }

                    $i.pop()

                    $step = 6

                case 6:

                    break SERIALIZE

                }
            }

            return { start: $start, serialize: null }
        }
    }
}
