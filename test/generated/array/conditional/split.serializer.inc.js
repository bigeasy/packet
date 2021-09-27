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
                            } else {
                                $step = 5
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

                            $step = 8
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

                        case 8:

                            $i[0] = 0

                        case 9:

                            $bite = 0
                            $_ = object.array[$i[0]]

                        case 10:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 10
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                            if (++$i[0] != object.array.length) {
                                $step = 9
                                continue
                            }

                        case 11:

                            $bite = 0
                            $_ = object.sentry

                        case 12:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 12
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
