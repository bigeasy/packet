module.exports = function ({ serializers, $lookup }) {
    serializers.inc.object = function () {
        return function (object, $step = 0, $i = []) {
            let $_, $bite

            return function $serialize ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        $step = 1
                        $bite = 0
                        $_ = object.nudge

                    case 1:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                    case 2:

                        $step = 3
                        $bite = 1
                        $_ = object.array.length

                    case 3:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        $i[0] = 0

                    case 4:

                        $step = 5
                        $bite = 1
                        $_ = object.array[$i[0]].length

                    case 5:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        $i[1] = 0

                    case 6:

                        $step = 7
                        $bite = 1
                        $_ = object.array[$i[0]][$i[1]]

                    case 7:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                        if (++$i[1] != object.array[$i[0]].length) {
                            $step = 6
                            continue
                        }

                        if (++$i[0] != object.array.length) {
                            $step = 4
                            continue
                        }

                    case 8:

                        $step = 9
                        $bite = 0
                        $_ = object.sentry

                    case 9:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                        $step = 10

                    case 10:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
