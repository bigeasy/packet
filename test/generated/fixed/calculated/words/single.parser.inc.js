module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = [], $I = []) {
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
                            $I[0] = (() => 8)()

                        case 4:

                            $step = 4

                            if ($i[0] == $I[0]) {
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

                        case 6:

                            if ($start == $end) {
                                $step = 6
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.array[$i[0]] = $buffer[$start++]

                        case 7:

                            $i[0]++
                            $step = 4
                            continue

                        case 8:

                            $_ = $I[0] != $i[0]
                                ? ($I[0] - $i[0]) * 1 - 1
                                : 0

                        case 9: {

                            const length = Math.min($_, $end - $start)
                            $start += length
                            $_ -= length

                            if ($_ != 0) {
                                $step = 9
                                return { start: $start, object: null, parse: $parse }
                            }

                        }

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
