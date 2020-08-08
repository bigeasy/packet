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

                            switch (($ => $.type)(object)) {
                            case 0:

                                $step = 3
                                continue

                            case 1:

                                $step = 5
                                continue

                            case 2:

                                $step = 9
                                continue

                            case 3:

                                $step = 14
                                continue

                            case 4:

                                $step = 17
                                continue

                            default:

                                $step = 20
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
                            $step = 22
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
                            $i[0] = 0

                        case 7:

                            $bite = 0
                            $_ = object.value[$i[0]]

                        case 8:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 8
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                            if (++$i[0] != object.value.length) {
                                $step = 7
                                continue
                            }
                            $step = 22
                            continue

                        case 9:

                            $i[0] = 0
                            $step = 10

                        case 10:

                            $bite = 0
                            $_ = object.value[$i[0]]

                        case 11:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 11
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }
                            if (++$i[0] != object.value.length) {
                                $step = 10
                                continue
                            }

                            $step = 12

                        case 12:

                            if ($start == $end) {
                                $step = 12
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x0

                        case 13:
                            $step = 22
                            continue

                        case 14:

                            $bite = 0
                            $_ = object.value.length

                        case 15:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 15
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                        case 16: {

                            const $bytes = Math.min($end - $start, object.value.length - $copied)
                            object.value.copy($buffer, $start, $copied, $copied + $bytes)
                            $copied += $bytes
                            $start += $bytes

                            if ($copied != object.value.length) {
                                $step = 16
                                return { start: $start, serialize: $serialize }
                            }

                            $copied = 0

                        }
                            $step = 22
                            continue

                        case 17:

                            $i[0] = 0
                            $step = 18

                        case 18:

                            $bite = 0
                            $_ = object.value[$i[0]]

                        case 19:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 19
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }
                            if (++$i[0] != object.value.length) {
                                $step = 18
                                continue
                            }
                            $step = 22
                            continue

                        case 20:

                            $_ = 0

                        case 21: {

                                const length = Math.min($end - $start, object.value.length - $_)
                                object.value.copy($buffer, $start, $_, $_ + length)
                                $start += length
                                $_ += length

                                if ($_ != object.value.length) {
                                    $step = 21
                                    return { start: $start, serialize: $serialize }
                                }

                            }

                        case 22:

                            $bite = 0
                            $_ = object.sentry

                        case 23:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 23
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
