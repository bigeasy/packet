module.exports = function ({ parsers }) {
    parsers.inc.object = function () {


        return function (object = {}, $step = 0, $i = []) {
            let $_, $bite

            return function parse ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        object = {
                            array: [],
                            sentry: 0
                        }

                        $step = 1

                    case 1:

                        $i[0] = 0

                    case 2:

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] == 0x0) {
                            $start++
                            $step = 7
                            continue
                        }

                        $step = 6

                    case 3:

                    case 4:

                        $step = 5

                    case 5:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }

                        object.array[$i[0]] = $buffer[$start++]


                    case 6:

                        $i[0]++

                        if ($i[0] == 8) {
                            $step = 7
                            continue
                        }

                        $step = 2
                        continue

                    case 7:

                        $_ = (8 - $i[0]) * 1 - 1
                        $step = 8

                    case 8:

                        $bite = Math.min($end - $start, $_)
                        $_ -= $bite
                        $start += $bite

                        if ($_ != 0) {
                            return { start: $start, object: null, parse }
                        }

                        $step = 9

                    case 9:

                        $step = 10

                    case 10:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }

                        object.sentry = $buffer[$start++]


                    case 11:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
