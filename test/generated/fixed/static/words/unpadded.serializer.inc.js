module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            $step = 1
                            $bite = 0
                            $_ = object.nudge

                        case 1:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }


                        case 2:

                            $i[0] = 0
                            $step = 3

                        case 3:

                            $step = 4
                            $bite = 1
                            $_ = object.array[$i[0]]

                        case 4:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                            if (++$i[0] != object.array.length) {
                                $step = 3
                                continue
                            }

                        $step = 5

                        case 5:

                            $step = 6
                            $bite = 0
                            $_ = object.sentry

                        case 6:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }


                            $step = 7

                        case 7:

                            break

                        }

                        break
                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
