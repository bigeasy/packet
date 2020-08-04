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

                            $step = 1

                        case 1:

                            $step = 2

                        case 2:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.nudge = $buffer[$start++]


                        case 3:

                            $i[0] = 0

                        case 4:

                            $step = 4

                            if ($i[0] == 8) {
                                $step = 8
                                continue
                            }

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start] == 0x0) {
                                $start++
                                $step = 8
                                continue
                            }

                            $step = 5

                        case 5:

                            $step = 6

                        case 6:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.array[$i[0]] = $buffer[$start++]


                        case 7:

                            $i[0]++
                            $step = 4
                            continue

                        case 8:

                            $_ = 8 != $i[0]
                                ? (8 - $i[0]) * 1 - 1
                                : 0

                            $step = 9

                        case 9: {

                            const length = Math.min($_, $end - $start)
                            $start += length
                            $_ -= length

                            if ($_ != 0) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            $step = 10

                        }

                        case 10:

                            $step = 11

                        case 11:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.sentry = $buffer[$start++]


                        case 12:

                            return { start: $start, object: object, parse: null }
                        }
                        break
                    }
                }
            }
        } ()
    }
}
