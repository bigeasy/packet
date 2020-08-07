module.exports = function ({ $lookup }) {
    return {
        object: function () {
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

                        case 1:

                        case 2:

                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.nudge = $buffer[$start++]

                        case 3:

                            $i[0] = 0

                        case 4:

                            $_ = 0
                            $bite = 1

                        case 5:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 5
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            object.array[$i[0]] = $_

                        case 6:

                            $i[0]++

                            if ($i[0] != 4) {
                                $step = 4
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
