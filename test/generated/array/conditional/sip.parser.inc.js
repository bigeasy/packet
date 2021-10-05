module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = [], $I = [], $sip = []) {
                let $_

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                nudge: 0,
                                array: [],
                                sentry: 0
                            }

                        case 1:

                        case 2:

                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.nudge = $buffer[$start++]

                        case 3:

                        case 4:

                            if ($start == $end) {
                                $step = 4
                                return { start: $start, object: null, parse: $parse }
                            }

                            $sip[0] = $buffer[$start++]

                        case 5:

                            if ((sip => (sip & 0x80) == 0)($sip[0])) {
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

                        case 7:

                            if ($start == $end) {
                                $step = 7
                                return { start: $start, object: null, parse: $parse }
                            }

                            $I[0] = $buffer[$start++]

                            $step = 18
                            continue

                        case 8:

                        case 9:

                            if ($start == $end) {
                                $step = 9
                                return { start: $start, object: null, parse: $parse }
                            }

                            $sip[1] = $buffer[$start++]

                        case 10:

                            if ((sip => (sip & 0x80) == 0)($sip[1])) {
                                $step = 11
                                $parse(Buffer.from([
                                    $sip[0] & 0xff,
                                    $sip[1] & 0xff
                                ]), 0, 2)
                                continue
                            } else {
                                $step = 14
                                $parse(Buffer.from([
                                    $sip[0] & 0xff,
                                    $sip[1] & 0xff
                                ]), 0, 2)
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

                            $I[0] = $_

                            $step = 18
                            continue

                        case 14:

                            $_ = 0

                        case 15:

                            if ($start == $end) {
                                $step = 15
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] & 127 << 14

                        case 16:

                            if ($start == $end) {
                                $step = 16
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] & 127 << 7

                        case 17:

                            if ($start == $end) {
                                $step = 17
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] << 0

                            $I[0] = $_



                        case 18:

                            $i[0] = 0

                        case 19:

                        case 20:

                            if ($start == $end) {
                                $step = 20
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.array[$i[0]] = $buffer[$start++]
                            if (++$i[0] != $I[0]) {
                                $step = 19
                                continue
                            }

                        case 21:

                        case 22:

                            if ($start == $end) {
                                $step = 22
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.sentry = $buffer[$start++]

                        }

                        return { start: $start, object: object, parse: null }
                        break
                    }
                }
            }
        } ()
    }
}
