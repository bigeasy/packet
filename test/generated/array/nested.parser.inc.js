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

                            object.array[$i[0]] = []

                        case 6:

                            $_ = 0
                            $bite = 1

                        case 7:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 7
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            $I[1] = $_
                            $i[1] = 0
                        case 8:

                            $_ = 0
                            $bite = 1

                        case 9:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 9
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            object.array[$i[0]][$i[1]] = $_
                            if (++$i[1] != $I[1]) {
                                $step = 8
                                continue
                            }
                            if (++$i[0] != $I[0]) {
                                $step = 5
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
