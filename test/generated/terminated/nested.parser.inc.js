module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $bite, $length = 0

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

                            $i[0] = 0

                        case 4:

                            $step = 4

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start] != 0x0) {
                                $step = 6
                                continue
                            }
                            $start++

                            $step = 5

                        case 5:

                            $step = 5

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start] != 0x0) {
                                $step = 6
                                $parse(Buffer.from([ 0x0 ]), 0, 1)
                                continue
                            }
                            $start++

                            $step = 15
                            continue

                        case 6:

                            object.array[$i[0]] = []

                        case 7:

                            $i[1] = 0

                        case 8:

                            $step = 8

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start] != 0x0) {
                                $step = 10
                                continue
                            }
                            $start++

                            $step = 9

                        case 9:

                            $step = 9

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start] != 0x0) {
                                $step = 10
                                $parse(Buffer.from([ 0x0 ]), 0, 1)
                                continue
                            }
                            $start++

                            $step = 13
                            continue

                        case 10:

                            $_ = 0
                            $bite = 1

                        case 11:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 11
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            object.array[$i[0]][$i[1]] = $_

                        case 12:

                            $i[1]++
                            $step = 8
                            continue

                        case 13:

                        case 14:

                            $i[0]++
                            $step = 4
                            continue

                        case 15:

                        case 16:

                        case 17:

                            if ($start == $end) {
                                $step = 17
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
