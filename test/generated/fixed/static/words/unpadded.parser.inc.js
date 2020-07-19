module.exports = function ({ parsers, $lookup }) {
    parsers.inc.object = function () {
        return function (object, $step = 0, $i = []) {
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

                    case 5:

                        $_ = 0
                        $step = 6
                        $bite = 1

                    case 6:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                            $bite--
                        }

                        object.array[$i[0]] = $_


                    case 7:

                        $i[0]++

                        if ($i[0] != 4) {
                            $step = 4
                            continue
                        }

                        $_ = (4 - $i[0]) * 4 * 2 - 0
                        $step = 8


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
