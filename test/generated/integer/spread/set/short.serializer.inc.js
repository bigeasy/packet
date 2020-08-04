module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
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

                        $_ = object.value

                    case 3:

                        if ($start == $end) {
                            $step = 3
                            return { start: $start, serialize: $serialize }
                        }

                        $buffer[$start++] = $_ >>> 7 & 0x7f | 0x80

                    case 4:

                        if ($start == $end) {
                            $step = 4
                            return { start: $start, serialize: $serialize }
                        }

                        $buffer[$start++] = $_ >>> 0 & 0x7f

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

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
