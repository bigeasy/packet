module.exports = function ({ serializers, $lookup }) {
    serializers.inc.object = function () {
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
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                    case 2:

                        $i[0] = 0

                    case 3:

                        $step = 4
                        $bite = 0
                        $_ = [15,173,237]

                    case 4:

                        while ($bite != 3) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_[$bite++]
                        }


                    case 5:

                        if (++$i[0] < 2) {
                            $step = 3
                            continue
                        }

                    case 6:

                        $step = 7
                        $bite = 1
                        $_ = object.padded

                    case 7:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                    case 8:

                        $i[0] = 0

                    case 9:

                        $step = 10
                        $bite = 0
                        $_ = [222,202,250]

                    case 10:

                        while ($bite != 3) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_[$bite++]
                        }


                    case 11:

                        if (++$i[0] < 2) {
                            $step = 9
                            continue
                        }

                    case 12:

                        $step = 13
                        $bite = 0
                        $_ = object.sentry

                    case 13:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                        $step = 14

                    case 14:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
