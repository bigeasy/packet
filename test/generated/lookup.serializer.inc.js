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
                        $_ = $lookup[0].indexOf(object.value)

                    case 3:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 3
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                    case 4:

                        $bite = 0
                        $_ = $lookup[1].indexOf(object.yn)

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
                        $_ = $lookup[0].indexOf(object.binary)

                    case 7:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 7
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                    case 8:

                        $bite = 0
                        $_ = $lookup[2].reverse[object.mapped]

                    case 9:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 9
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                    case 10:

                        $bite = 0
                        $_ = object.sentry

                    case 11:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 11
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                        $step = 12

                    case 12:

                        break

                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
