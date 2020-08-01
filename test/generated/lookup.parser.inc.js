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
                        yn: 0,
                        binary: 0,
                        mapped: 0,
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
                    $bite = 0

                case 4:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }
                        $_ += $buffer[$start++] << $bite * 8 >>> 0
                        $bite--
                    }

                    object.value = $lookup[0][$_]


                case 5:

                    $_ = 0
                    $step = 6
                    $bite = 0

                case 6:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }
                        $_ += $buffer[$start++] << $bite * 8 >>> 0
                        $bite--
                    }

                    object.yn = $lookup[1][$_]


                case 7:

                    $_ = 0
                    $step = 8
                    $bite = 0

                case 8:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }
                        $_ += $buffer[$start++] << $bite * 8 >>> 0
                        $bite--
                    }

                    object.binary = $lookup[0][$_]


                case 9:

                    $_ = 0
                    $step = 10
                    $bite = 0

                case 10:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }
                        $_ += $buffer[$start++] << $bite * 8 >>> 0
                        $bite--
                    }

                    object.mapped = $lookup[2].forward[$_]


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
            }
        }
    } ()
}
