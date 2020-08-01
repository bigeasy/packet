module.exports = function ({ parsers, $lookup }) {
    parsers.inc.object = function () {
        return function (object, $step = 0) {
            let $_, $bite

            return function $parse ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    object = {
                        nudge: 0,
                        value: 0,
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

                    $_ = 0
                    $step = 4
                    $bite = 1

                case 4:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }
                        $_ += $buffer[$start++] << $bite * 7 >>> 0
                        $bite--
                    }

                    object.value = $_


                case 5:

                    $step = 6

                case 6:

                    if ($start == $end) {
                        return { start: $start, object: null, parse: $parse }
                    }

                    object.sentry = $buffer[$start++]


                case 7:

                    return { start: $start, object: object, parse: null }
                }
            }
        }
    } ()
}
