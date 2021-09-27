module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = []) {
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

                            if ((value => value < 128)(object.array.length)) {
                                $step = 3
                                continue
                            } else if ((value => value < 0x3fff)(object.array.length)) {
                                $step = 5
                                continue
                            } else {
                                $step = 8
                                continue
                            }

                        case 3:

                            $bite = 0
                            $_ = object.array.length

                        case 4:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 4
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                            $step = 12
                            continue

                        case 5:

                            $_ = object.array.length

                        case 6:

                            if ($start == $end) {
                                $step = 6
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = $_ >>> 7 & 0x7f | 0x80

                        case 7:

                            if ($start == $end) {
                                $step = 7
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = $_ >>> 0 & 0x7f

                            $step = 12
                            continue

                        case 8:

                            $_ = object.array.length

                        case 9:

                            if ($start == $end) {
                                $step = 9
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = $_ >>> 14 & 0x7f | 0x80

                        case 10:

                            if ($start == $end) {
                                $step = 10
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = $_ >>> 7 & 0x7f | 0x80

                        case 11:

                            if ($start == $end) {
                                $step = 11
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = $_ >>> 0 & 0x7f

                        case 12:

                            $i[0] = 0

                        case 13:

                            $bite = 0
                            $_ = object.array[$i[0]]

                        case 14:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 14
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                            if (++$i[0] != object.array.length) {
                                $step = 13
                                continue
                            }

                        case 15:

                            $bite = 0
                            $_ = object.sentry

                        case 16:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 16
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
