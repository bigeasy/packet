module.exports = function ({ parsers, $lookup }) {
    parsers.inc.object = function () {
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

                        object.array[$i[0]] = []

                    case 5:

                        $step = 6

                    case 6:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        $I[0] = $buffer[$start++]

                        $i[1] = 0
                    case 7:


                    case 8:

                        $step = 9

                    case 9:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.array[$i[0]][$i[1]] = $buffer[$start++]

                        if (++$i[1] != $I[0]) {
                            $step = 7
                            continue
                        }

                    case 10:

                        $i[0]++

                        if ($i[0] != 2) {
                            $step = 4
                            continue
                        }

                        $_ = (2 - $i[0]) * 2 * 0 - 0
                        $step = 11


                    case 11:

                        $step = 12

                    case 12:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]


                    case 13:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
