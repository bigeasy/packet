module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = [], $I = []) {
                let $_, $bite

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
                            $I[0] = (() => 2)()

                        case 4:

                            object.array[$i[0]] = []

                        case 5:

                        case 6:

                            if ($start == $end) {
                                $step = 6
                                return { start: $start, object: null, parse: $parse }
                            }

                            $I[1] = $buffer[$start++]
                            $i[1] = 0
                        case 7:

                        case 8:

                            if ($start == $end) {
                                $step = 8
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.array[$i[0]][$i[1]] = $buffer[$start++]
                            if (++$i[1] != $I[1]) {
                                $step = 7
                                continue
                            }

                        case 9:

                            $i[0]++

                            if ($i[0] != $I[0]) {
                                $step = 4
                                continue
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
