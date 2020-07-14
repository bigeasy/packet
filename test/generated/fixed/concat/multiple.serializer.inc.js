module.exports = function ({ serializers }) {
    serializers.inc.object = function () {


        return function (object, $step = 0, $i = []) {
            let $_, $bite

            return function serialize ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        $_ = 0

                        $step = 1

                    case 1: {

                            const length = Math.min($end - $start, object.array.length - $_)
                            object.array.copy($buffer, $start, $_, $_ + length)
                            $start += length
                            $_ += length

                            if ($_ != object.array.length) {
                                return { start: $start, serialize }
                            }

                            $step = 2

                        }

                        $step = 2

                    case 2:

                        if ($start == $end) {
                            return { start: $start, serialize }
                        }

                        if ($_++ == 8) {
                            $step = 4
                            continue
                        }

                        $buffer[$start++] = 0xa

                        $step = 3

                        $step = 3

                    case 3:

                        if ($start == $end) {
                            return { start: $start, serialize }
                        }

                        if ($_++ == 8) {
                            $step = 4
                            continue
                        }

                        $buffer[$start++] = 0xb

                        $step = 4

                        if ($_ != 8) {
                            $step = 2
                            continue
                        }

                    case 4:

                        $step = 5
                        $bite = 0
                        $_ = object.sentry

                    case 5:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                        $step = 6

                    case 6:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
