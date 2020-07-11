module.exports = function ({ parsers }) {
    parsers.inc.object = function () {


        return function (object = {}, $step = 0, $i = []) {
            let $_, $bite, $length = 0

            return function parse ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        object = {
                            array: [],
                            sentry: []
                        }

                        $step = 1

                    case 1:

                        $i[0] = 0

                    case 2:

                    case 3:

                        $_ = 0
                        $step = 4
                        $bite = 1

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, object: null, parse }
                            }
                            $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                            $bite--
                        }

                        object.array[$i[0]] = $_


                    case 5:

                        $i[0]++

                        if ($i[0] != 4) {
                            $step = 3
                            continue
                        }

                        $_ = (4 - $i[0]) * 2 - 0
                        $step = 6

                    case 6:

                        $bite = Math.min($end - $start, $_)
                        $_ -= $bite
                        $start += $bite

                        if ($_ != 0) {
                            return { start: $start, object: null, parse }
                        }

                        $step = 7

                    case 7:

                        $i[0] = 0

                    case 8:

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] == 0x0) {
                            $start++
                            $step = 13
                            continue
                        }

                        $step = 9

                    case 9:


                    case 10:

                        $step = 11

                    case 11:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }

                        object.sentry[$i[0]] = $buffer[$start++]


                    case 12:

                        $i[0]++
                        $step = 8
                        continue

                    case 13:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
