module.exports = function ({ serializers }) {
    serializers.inc.object = function () {


        return function (object, $step = 0, $i = []) {
            let $_, $bite

            return function serialize ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        $i[0] = 0
                        $step = 1

                    case 1:

                        $step = 2
                        $bite = 1
                        $_ = object.array[$i[0]]

                    case 2:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        if (++$i[0] != object.array.length) {
                            $step = 1
                            continue
                        }

                        $_ = $i[0] * 2

                        $step = 3


                    if ($_ != 8) {
                        $step = 3
                        continue
                    }

                    case 3:

                        $i[0] = 0
                        $step = 4

                    case 4:

                        $step = 5
                        $bite = 0
                        $_ = object.sentry[$i[0]]

                    case 5:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        if (++$i[0] != object.sentry.length) {
                            $step = 4
                            continue
                        }

                        $step = 6

                    case 6:

                        if ($start == $end) {
                            return { start: $start, serialize }
                        }

                        $buffer[$start++] = 0x0

                        $step = 7

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
