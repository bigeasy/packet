module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = [], $I = []) {
                let $_, $length = 0

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
                            $I[0] = (() => 16)()

                        case 4:

                            $step = 4

                            if ($i[0] == $I[0]) {
                                $step = 9
                                continue
                            }

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start] != 0xd) {
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

                            if ($buffer[$start] != 0xa) {
                                $step = 6
                                $parse(Buffer.from([ 0xd ]), 0, 1)
                                continue
                            }
                            $start++

                            $step = 9
                            continue

                        case 6:

                        case 7:

                            if ($start == $end) {
                                $step = 7
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.array[$i[0]] = $buffer[$start++]

                        case 8:

                            $i[0]++
                            $step = 4
                            continue

                        case 9:

                            $_ = $I[0] != $i[0]
                                ? ($I[0] - $i[0]) * 1 - 2
                                : 0

                        case 10: {

                            const length = Math.min($_, $end - $start)
                            $start += length
                            $_ -= length

                            if ($_ != 0) {
                                $step = 10
                                return { start: $start, object: null, parse: $parse }
                            }

                        }

                        case 11:

                        case 12:

                            if ($start == $end) {
                                $step = 12
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
