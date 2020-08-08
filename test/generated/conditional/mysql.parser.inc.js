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
                                value: 0,
                                sentry: 0
                            }

                        case 1:

                        case 2:

                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }

                            $sip[0] = $buffer[$start++]

                        case 3:

                            if ((sip => sip < 251)($sip[0])) {
                                $step = 4
                                $parse(Buffer.from([
                                    $sip[0] & 0xff
                                ]), 0, 1)
                                continue
                            } else if ((sip => sip == 0xfc)($sip[0])) {
                                $step = 6
                                $parse(Buffer.from([
                                    $sip[0] & 0xff
                                ]), 0, 1)
                                continue
                            } else {
                                $step = 10
                                $parse(Buffer.from([
                                    $sip[0] & 0xff
                                ]), 0, 1)
                                continue
                            }

                        case 4:

                        case 5:

                            if ($start == $end) {
                                $step = 5
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.value = $buffer[$start++]

                            $step = 14
                            continue

                        case 6:

                            $_ = 1

                        case 7:

                            $bite = Math.min($end - $start, $_)
                            $_ -= $bite
                            $start += $bite

                            if ($_ != 0) {
                                $step = 7
                                return { start: $start, object: null, parse: $parse }
                            }

                        case 8:

                            $_ = 0
                            $bite = 1

                        case 9:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 9
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            object.value = $_


                            $step = 14
                            continue

                        case 10:

                            $_ = 1

                        case 11:

                            $bite = Math.min($end - $start, $_)
                            $_ -= $bite
                            $start += $bite

                            if ($_ != 0) {
                                $step = 11
                                return { start: $start, object: null, parse: $parse }
                            }

                        case 12:

                            $_ = 0
                            $bite = 2

                        case 13:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 13
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            object.value = $_



                        case 14:

                        case 15:

                            if ($start == $end) {
                                $step = 15
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
