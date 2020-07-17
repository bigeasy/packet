module.exports = function ({ serializers, $lookup }) {
    serializers.inc.object = function () {
        return function (object, $step = 0, $i = []) {
            let $_, $bite, $copied = 0

            return function $serialize ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        $step = 1
                        $bite = 0
                        $_ = object.type

                    case 1:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
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
                        } else if (($ => $.type == 2)(object)) {
                            $step = 9
                            continue
                        } else if (($ => $.type == 3)(object)) {
                            $step = 14
                            continue
                        } else if (($ => $.type == 4)(object)) {
                            $step = 17
                            continue
                        } else {
                            $step = 20
                            continue
                        }

                    case 3:

                        $step = 4
                        $bite = 0
                        $_ = object.value.value

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                        $step = 22
                        continue

                    case 5:

                        $step = 6
                        $bite = 0
                        $_ = object.value.length

                    case 6:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        $i[0] = 0

                    case 7:

                        $step = 8
                        $bite = 0
                        $_ = object.value[$i[0]]

                    case 8:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
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

                        $step = 11
                        $bite = 0
                        $_ = object.value[$i[0]]

                    case 11:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        if (++$i[0] != object.value.length) {
                            $step = 10
                            continue
                        }

                        $step = 12

                    case 12:

                        if ($start == $end) {
                            return { start: $start, serialize: $serialize }
                        }

                        $buffer[$start++] = 0x0

                        $step = 13

                    case 13:

                        $step = 22
                        continue

                    case 14:

                        $step = 15
                        $bite = 0
                        $_ = object.value.length

                    case 15:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                    case 16: {

                        const $bytes = Math.min($end - $start, object.value.length - $copied)
                        object.value.copy($buffer, $start, $copied, $copied + $bytes)
                        $copied += $bytes
                        $start += $bytes

                        if ($copied != object.value.length) {
                            return { start: $start, serialize: $serialize }
                        }

                        $copied = 0

                        $step = 17

                    }

                        $step = 22
                        continue

                    case 17:

                        $i[0] = 0
                        $step = 18

                    case 18:

                        $step = 19
                        $bite = 0
                        $_ = object.value[$i[0]]

                    case 19:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        if (++$i[0] != object.value.length) {
                            $step = 18
                            continue
                        }

                    $step = 20

                        $step = 22
                        continue

                    case 20:

                        $_ = 0

                        $step = 21

                    case 21: {

                            const length = Math.min($end - $start, object.value.length - $_)
                            object.value.copy($buffer, $start, $_, $_ + length)
                            $start += length
                            $_ += length

                            if ($_ != object.value.length) {
                                return { start: $start, serialize: $serialize }
                            }

                            $step = 22

                        }

                    case 22:

                        $step = 23
                        $bite = 0
                        $_ = object.sentry

                    case 23:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                        $step = 24

                    case 24:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
