module.exports = function (serializers) {
    serializers.inc.object = function (object, $step = 0) {
        let $bite, $stop, $_

        return function serialize ($buffer, $start, $end) {
            for (;;) {
                switch ($step) {
                case 0:

                    $step = 1
                    $bite = 0
                    $_ = object.type

                case 1:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }


                case 2:

                    if (($ => $.type == 0)(object)) {
                        $step = 3
                        continue
                    } else if (($ => $.type == 1)(object)) {
                        $step = 5
                        continue
                    } else {
                        $step = 7
                        continue
                    }

                case 3:

                    $step = 4
                    $bite = 1
                    $_ = object.value

                case 4:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }

                    $step = 9
                    continue

                case 5:

                    $step = 6
                    $bite = 2
                    $_ = object.value

                case 6:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }

                    $step = 9
                    continue

                case 7:

                    $step = 8
                    $bite = 3
                    $_ = object.value

                case 8:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }

                case 9:

                    $step = 10
                    $bite = 0
                    $_ = object.sentry

                case 10:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }


                    $step = 11

                case 11:

                    break

                }

                break
            }

            return { start: $start, serialize: null }
        }
    }
}
