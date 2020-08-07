module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $bite = 0
                        $_ = object.nudge

                    case 1:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 1
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                    case 2:

                        $bite = 0
                        $_ = [ 15, 173, 237 ]

                    case 3:

                        while ($bite != 3) {
                            if ($start == $end) {
                                $step = 3
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_[$bite++]
                        }


                    case 4:

                        $bite = 1
                        $_ = object.padded

                    case 5:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 5
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                    case 6:

                        $bite = 0
                        $_ = [ 250, 202, 222 ]

                    case 7:

                        while ($bite != 3) {
                            if ($start == $end) {
                                $step = 7
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_[$bite++]
                        }


                    case 8:

                        $bite = 0
                        $_ = object.sentry

                    case 9:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 9
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }

                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
