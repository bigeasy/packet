module.exports = function ({ serializers, $lookup }) {
    serializers.inc.object = function () {
        return function (object, $step = 0) {
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
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                    case 2:

                        if ((value => value <= 0x7f)(object.value)) {
                            $step = 3
                            continue
                        } else if ((value => value <= 0x3fff)(object.value)) {
                            $step = 5
                            continue
                        } else if ((value => value <= 0x1fffff)(object.value)) {
                            $step = 8
                            continue
                        } else {
                            $step = 12
                            continue
                        }

                    case 3:

                        $step = 4
                        $bite = 0
                        $_ = object.value

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                        $step = 17
                        continue

                    case 5:

                        $_ = object.value

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

                        $step = 17
                        continue

                    case 8:

                        $_ = object.value

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

                        $step = 17
                        continue

                    case 12:

                        $_ = object.value

                    case 13:

                        if ($start == $end) {
                            $step = 13
                            return { start: $start, serialize: $serialize }
                        }

                        $buffer[$start++] = $_ >>> 21 & 0x7f | 0x80

                    case 14:

                        if ($start == $end) {
                            $step = 14
                            return { start: $start, serialize: $serialize }
                        }

                        $buffer[$start++] = $_ >>> 14 & 0x7f | 0x80

                    case 15:

                        if ($start == $end) {
                            $step = 15
                            return { start: $start, serialize: $serialize }
                        }

                        $buffer[$start++] = $_ >>> 7 & 0x7f | 0x80

                    case 16:

                        if ($start == $end) {
                            $step = 16
                            return { start: $start, serialize: $serialize }
                        }

                        $buffer[$start++] = $_ >>> 0 & 0x7f

                    case 17:

                        $step = 18
                        $bite = 0
                        $_ = object.sentry

                    case 18:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                        $step = 19

                    case 19:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
