module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $sip = []) {
                let $_, $bite

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                nudge: 0,
                                value: 0,
                                sentry: 0
                            }

                            $step = 1

                        case 1:

                            $step = 2

                        case 2:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.nudge = $buffer[$start++]


                        case 3:

                            $step = 4

                        case 4:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            $sip[0] = $buffer[$start++]


                        case 5:

                            if ((sip => (sip & 0x80) == 0)($sip[0], object, object)) {
                                $step = 6
                                $parse(Buffer.from([
                                    $sip[0] & 0xff
                                ]), 0, 1)
                                continue
                            } else {
                                $step = 8
                                continue
                            }

                        case 6:

                            $step = 7

                        case 7:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.value = $buffer[$start++]


                            $step = 26
                            continue

                        case 8:

                            $step = 9

                        case 9:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            $sip[1] = $buffer[$start++]


                        case 10:

                            if ((sip => (sip & 0x80) == 0)($sip[1], object, object)) {
                                $step = 11
                                $parse(Buffer.from([
                                    $sip[0] & 0xff,
                                    $sip[1] & 0xff
                                ]), 0, 2)
                                continue
                            } else {
                                $step = 14
                                continue
                            }

                        case 11:

                            $_ = 0

                        case 12:

                            if ($start == $end) {
                                $step = 12
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] & 127 << 7

                        case 13:

                            if ($start == $end) {
                                $step = 13
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] << 0

                            object.value = $_

                            $step = 26
                            continue

                        case 14:

                            $step = 15

                        case 15:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            $sip[2] = $buffer[$start++]


                        case 16:

                            if ((sip => (sip & 0x80) == 0)($sip[2], object, object)) {
                                $step = 17
                                $parse(Buffer.from([
                                    $sip[0] & 0xff,
                                    $sip[1] & 0xff,
                                    $sip[2] & 0xff
                                ]), 0, 3)
                                continue
                            } else {
                                $step = 21
                                $parse(Buffer.from([
                                    $sip[0] & 0xff,
                                    $sip[1] & 0xff,
                                    $sip[2] & 0xff
                                ]), 0, 3)
                                continue
                            }

                        case 17:

                            $_ = 0

                        case 18:

                            if ($start == $end) {
                                $step = 18
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] & 127 << 14

                        case 19:

                            if ($start == $end) {
                                $step = 19
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] & 127 << 7

                        case 20:

                            if ($start == $end) {
                                $step = 20
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] << 0

                            object.value = $_

                            $step = 26
                            continue

                        case 21:

                            $_ = 0

                        case 22:

                            if ($start == $end) {
                                $step = 22
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] & 127 << 21

                        case 23:

                            if ($start == $end) {
                                $step = 23
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] & 127 << 14

                        case 24:

                            if ($start == $end) {
                                $step = 24
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] & 127 << 7

                        case 25:

                            if ($start == $end) {
                                $step = 25
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] << 0

                            object.value = $_




                        case 26:

                            $step = 27

                        case 27:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.sentry = $buffer[$start++]


                        case 28:

                            return { start: $start, object: object, parse: null }
                        }
                        break
                    }
                }
            }
        } ()
    }
}
