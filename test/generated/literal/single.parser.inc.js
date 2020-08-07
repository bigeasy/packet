module.exports = function ({ $lookup }) {
    return {
        object: function () {
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

                    case 1:

                    case 2:

                        if ($start == $end) {
                            $step = 2
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.nudge = $buffer[$start++]

                    case 3:

                        $_ = 3

                    case 4:

                        $bite = Math.min($end - $start, $_)
                        $_ -= $bite
                        $start += $bite

                        if ($_ != 0) {
                            $step = 4
                            return { start: $start, object: null, parse: $parse }
                        }

                    case 5:

                        $_ = 0
                        $bite = 1

                    case 6:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 6
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite--
                        }

                        object.padded = $_

                    case 7:

                        $_ = 3

                    case 8:

                        $bite = Math.min($end - $start, $_)
                        $_ -= $bite
                        $start += $bite

                        if ($_ != 0) {
                            $step = 8
                            return { start: $start, object: null, parse: $parse }
                        }

                    case 9:

                    case 10:

                        if ($start == $end) {
                            $step = 10
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]

                    }
                    return { start: $start, object: object, parse: null }
                }
            }
        } ()
    }
}
