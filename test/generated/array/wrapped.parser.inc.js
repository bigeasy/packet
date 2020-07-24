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

                        $_ = 1
                        $step = 4

                    case 4:

                        $bite = Math.min($end - $start, $_)
                        $_ -= $bite
                        $start += $bite

                        if ($_ != 0) {
                            return { start: $start, object: null, parse: $parse }
                        }

                    case 5:

                        $step = 6

                    case 6:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        $I[0] = $buffer[$start++]


                        $I[0] = (value => value)($I[0])

                        $i[0] = 0
                    case 7:


                    case 8:

                        $step = 9

                    case 9:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.array[$i[0]] = $buffer[$start++]

                        if (++$i[0] != $I[0]) {
                            $step = 7
                            continue
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
