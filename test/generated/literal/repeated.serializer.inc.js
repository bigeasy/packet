module.exports = function ({ serializers }) {
    serializers.inc.object = function () {
        return function (object, $step = 0, $i = []) {
            let $_, $bite

            return function serialize ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        $i[0] = 0

                    case 1:

                        $step = 2
                        $bite = 0
                        $_ = [15,173,237]

                    case 2:

                        while ($bite != 3) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = $_[$bite++]
                        }


                    case 3:

                        if (++$i[0] < 2) {
                            $step = 1
                            continue
                        }

                    case 4:

                        $step = 5
                        $bite = 1
                        $_ = object.padded

                    case 5:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                    case 6:

                        $i[0] = 0

                    case 7:

                        $step = 8
                        $bite = 0
                        $_ = [250,202,222]

                    case 8:

                        while ($bite != 3) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = $_[$bite++]
                        }


                    case 9:

                        if (++$i[0] < 2) {
                            $step = 7
                            continue
                        }

                    case 10:

                        $step = 11
                        $bite = 0
                        $_ = object.sentry

                    case 11:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                        $step = 12

                    case 12:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
