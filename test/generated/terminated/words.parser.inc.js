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

                            $step = 9
                            continue

                        case 6:

                            $_ = 0
                            $bite = 1

                        case 7:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 7
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            object.array[$i[0]] = $_

                        case 8:

                            $i[0]++
                            $step = 4
                            continue

                        case 9:

                        case 10:

                        case 11:

                            if ($start == $end) {
                                $step = 11
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
