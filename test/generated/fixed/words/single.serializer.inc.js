module.exports = function ({ serializers, $lookup }) {
    serializers.inc.object = function () {
        return function (object, $step = 0, $i = []) {
            let $_, $bite

            return function $serialize ($buffer, $start, $end) {
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
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        if (++$i[0] != object.array.length) {
                            $step = 1
                            continue
                        }

                        $_ = $i[0] * 1

                        $step = 3

                    case 3:

                        if ($start == $end) {
                            return { start: $start, serialize: $serialize }
                        }

                        if ($_++ == 8) {
                            $step = 4
                            continue
                        }

                        $buffer[$start++] = 0x0

                        $step = 4

                        if ($_ != 8) {
                            $step = 3
                            continue
                        }

                    case 4:

                        $step = 5
                        $bite = 0
                        $_ = object.sentry

                    case 5:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
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
    } ()
}
