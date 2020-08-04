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
                                value: [],
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

                            $I[0] = $buffer[$start++]

                            $i[0] = 0
                        case 5:


                        case 6:

                            $step = 7

                        case 7:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.value[$i[0]] = $buffer[$start++]

                            if (++$i[0] != $I[0]) {
                                $step = 5
                                continue
                            }

                        case 8:

                            $step = 9

                        case 9:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.sentry = $buffer[$start++]


                        case 10:

                            return { start: $start, object: object, parse: null }
                        }
                        break
                    }
                }
            }
        } ()
    }
}
