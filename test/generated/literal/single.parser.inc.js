module.exports = function ({ parsers, $lookup }) {
    parsers.inc.object = function () {
        return function (object, $step = 0) {
            let $_, $bite

            return function $parse ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    object = {
                        nudge: 0,
                        padded: 0,
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

                    $_ = 3
                    $step = 4

                case 4:

                    $bite = Math.min($end - $start, $_)
                    $_ -= $bite
                    $start += $bite

                    if ($_ != 0) {
                        return { start: $start, object: null, parse: $parse }
                    }

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

                    object.padded = $_


                case 7:

                    $_ = 3
                    $step = 8

                case 8:

                    $bite = Math.min($end - $start, $_)
                    $_ -= $bite
                    $start += $bite

                    if ($_ != 0) {
                        return { start: $start, object: null, parse: $parse }
                    }

                case 9:

                    $step = 10

                case 10:

                    if ($start == $end) {
                        return { start: $start, object: null, parse: $parse }
                    }

                    object.sentry = $buffer[$start++]


                case 11:

                    return { start: $start, object: object, parse: null }
                }
            }
        }
    } ()
}
