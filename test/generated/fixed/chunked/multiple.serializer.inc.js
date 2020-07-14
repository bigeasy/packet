module.exports = function ({ serializers }) {
    serializers.inc.object = function () {


        return function (object, $step = 0, $i = []) {
            let $_, $bite, $offset = 0, $length = 0

            return function serialize ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        $_ = 0
                        $offset = 0
                        $length = object.array.reduce((sum, buffer) => sum + buffer.length, 0)
                        $i[0] = 0

                        $step = 1

                    case 1: {

                        for (;;) {
                            const length = Math.min($end - $start, object.array[$i[0]].length - $offset)
                            object.array[$i[0]].copy($buffer, $start, $offset, $offset + length)
                            $offset += length
                            $start += length
                            $_ += length

                            if ($offset == object.array[$i[0]].length) {
                                $i[0]++
                                $offset = 0
                            }

                            if ($_ == $length) {
                                break
                            }

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

                        $buffer[$start++] = 0xd

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

                        $buffer[$start++] = 0xa

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
