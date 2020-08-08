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

                            $_ = 0
                            $bite = 1

                        case 4:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 4
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            $I[0] = $_
                            $i[0] = 0
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

                            object.array[$i[0]] = $_
                            if (++$i[0] != $I[0]) {
                                $step = 5
                                continue
                            }

                        case 7:

                        case 8:

                            if ($start == $end) {
                                $step = 8
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
