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

                    case 2:

                        $i[0] = 0
                        $step = 3

                    case 3:

                        $step = 4
                        $bite = 0
                        $_ = object.sentry[$i[0]]

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        if (++$i[0] != object.sentry.length) {
                            $step = 3
                            continue
                        }

                        $step = 5

                    case 5:

                        if ($start == $end) {
                            return { start: $start, serialize }
                        }

                        $buffer[$start++] = 0x0

                        $step = 6

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
