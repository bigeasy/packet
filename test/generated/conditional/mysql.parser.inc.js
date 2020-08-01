module.exports = function ({ parsers, $lookup }) {
    parsers.inc.object = function () {
        return function (object, $step = 0, $sip = 0) {
            let $_, $bite

            return function $parse ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        object = {
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

                        $sip = $buffer[$start++]


                    case 3:

                        if ((sip => sip < 251)($sip)) {
                            $step = 4
                            $parse([
                                ($sip >>> 0) & 0xff
                            ], 0, 1)
                            continue
                        } else if ((sip => sip == 0xfc)($sip)) {
                            $step = 6
                            $parse([
                                ($sip >>> 0) & 0xff
                            ], 0, 1)
                            continue
                        } else {
                            $step = 10
                            $parse([
                                ($sip >>> 0) & 0xff
                            ], 0, 1)
                            continue
                        }

                    case 4:

                        $step = 5

                    case 5:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.value = $buffer[$start++]


                        $step = 14
                        continue

                    case 6:

                        $_ = 1
                        $step = 7

                    case 7:

                        $bite = Math.min($end - $start, $_)
                        $_ -= $bite
                        $start += $bite

                        if ($_ != 0) {
                            return { start: $start, object: null, parse: $parse }
                        }

                    case 8:

                        $_ = 0
                        $step = 9
                        $bite = 1

                    case 9:

                        while ($bite != -1) {
                            if ($start == $end) {
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
                        $step = 11

                    case 11:

                        $bite = Math.min($end - $start, $_)
                        $_ -= $bite
                        $start += $bite

                        if ($_ != 0) {
                            return { start: $start, object: null, parse: $parse }
                        }

                    case 12:

                        $_ = 0
                        $step = 13
                        $bite = 2

                    case 13:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite--
                        }

                        object.value = $_




                    case 14:

                        $step = 15

                    case 15:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]


                    case 16:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
