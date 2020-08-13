module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $bite, $copied = 0

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            $bite = 0
                            $_ = object.type

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

                            if (($ => $.type == 0)(object)) {
                                $step = 3
                                continue
                            } else if (($ => $.type == 1)(object)) {
                                $step = 5
                                continue
                            } else if (($ => $.type == 2)(object)) {
                                $step = 10
                                continue
                            } else if (($ => $.type == 3)(object)) {
                                $step = 15
                                continue
                            } else if (($ => $.type == 4)(object)) {
                                $step = 18
                                continue
                            } else {
                                $step = 21
                                continue
                            }

                        case 3:

                            $bite = 0
                            $_ = object.value.value

                        case 4:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 4
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                            $step = 23
                            continue

                        case 5:

                            $bite = 0
                            $_ = object.value.length

                        case 6:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 6
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                        case 7:

                            $i[0] = 0

                        case 8:

                            $bite = 0
                            $_ = object.value[$i[0]]

                        case 9:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 9
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                            if (++$i[0] != object.value.length) {
                                $step = 8
                                continue
                            }

                            $step = 23
                            continue

                        case 10:

                            $i[0] = 0
                            $step = 11

                        case 11:

                            $bite = 0
                            $_ = object.value[$i[0]]

                        case 12:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 12
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }
                            if (++$i[0] != object.value.length) {
                                $step = 11
                                continue
                            }

                            $step = 13

                        case 13:

                            if ($start == $end) {
                                $step = 13
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x0

                        case 14:

                            $step = 23
                            continue

                        case 15:

                            $bite = 0
                            $_ = object.value.length

                        case 16:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 16
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                        case 17: {

                            const $bytes = Math.min($end - $start, object.value.length - $copied)
                            object.value.copy($buffer, $start, $copied, $copied + $bytes)
                            $copied += $bytes
                            $start += $bytes

                            if ($copied != object.value.length) {
                                $step = 17
                                return { start: $start, serialize: $serialize }
                            }

                            $copied = 0

                        }

                            $step = 23
                            continue

                        case 18:

                            $i[0] = 0
                            $step = 19

                        case 19:

                            $bite = 0
                            $_ = object.value[$i[0]]

                        case 20:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 20
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }
                            if (++$i[0] != object.value.length) {
                                $step = 19
                                continue
                            }

                            $step = 23
                            continue

                        case 21:

                            $_ = 0

                        case 22: {

                                const length = Math.min($end - $start, object.value.length - $_)
                                object.value.copy($buffer, $start, $_, $_ + length)
                                $start += length
                                $_ += length

                                if ($_ != object.value.length) {
                                    $step = 22
                                    return { start: $start, serialize: $serialize }
                                }

                            }

                        case 23:

                            $bite = 0
                            $_ = object.sentry

                        case 24:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 24
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
