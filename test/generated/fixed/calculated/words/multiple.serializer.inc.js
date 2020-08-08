module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = [], $I = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            $bite = 0
                            $_ = object.nudge

                        case 1:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 1
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                        case 2:

                            $i[0] = 0
                            $I[0] = (() => 16)()

                            $step = 3

                        case 3:

                            $bite = 0
                            $_ = object.array[$i[0]]

                        case 4:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 4
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }
                            if (++$i[0] != object.array.length) {
                                $step = 3
                                continue
                            }

                            $_ = $i[0] * 1

                        case 5:

                            if ($start == $end) {
                                $step = 5
                                return { start: $start, serialize: $serialize }
                            }

                            if ($_++ == $I[0] * 1) {
                                $step = 7
                                continue
                            }

                            $buffer[$start++] = 0xd

                        case 6:

                            if ($start == $end) {
                                $step = 6
                                return { start: $start, serialize: $serialize }
                            }

                            if ($_++ == $I[0] * 1) {
                                $step = 7
                                continue
                            }

                            $buffer[$start++] = 0xa

                            if ($_ != $I[0] * 1) {
                                $step = 5
                                continue
                            }

                        case 7:

                            $bite = 0
                            $_ = object.sentry

                        case 8:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 8
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                        }

                        break
                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
