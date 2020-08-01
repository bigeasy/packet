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
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                    case 2:

                        $_ = 0

                    case 3: {

                            $step = 3

                            const length = Math.min($end - $start, object.array.length - $_)
                            object.array.copy($buffer, $start, $_, $_ + length)
                            $start += length
                            $_ += length

                            if ($_ != object.array.length) {
                                return { start: $start, serialize: $serialize }
                            }

                            $step = 4

                        }

                        $step = 4

                    case 4:

                        if ($start == $end) {
                            return { start: $start, serialize: $serialize }
                        }

                        if ($_++ == 8) {
                            $step = 6
                            continue
                        }

                        $buffer[$start++] = 0xa

                        $step = 5

                        $step = 5

                    case 5:

                        if ($start == $end) {
                            return { start: $start, serialize: $serialize }
                        }

                        if ($_++ == 8) {
                            $step = 6
                            continue
                        }

                        $buffer[$start++] = 0xb

                        $step = 6

                        if ($_ != 8) {
                            $step = 4
                            continue
                        }

                    case 6:

                        $step = 7
                        $bite = 0
                        $_ = object.sentry

                    case 7:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                        $step = 8

                    case 8:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
