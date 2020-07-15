module.exports = function ({ parsers }) {
    parsers.inc.object = function () {


        return function (object = {}, $step = 0, $i = []) {
            let $_, $bite, $length = 0

            return function parse ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        object = {
                            nudge: 0,
                            array: [],
                            sentry: 0
                        }

                        $step = 1

                    case 1:

                        $step = 2

                    case 2:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }

                        object.nudge = $buffer[$start++]


                    case 3:

                        $i[0] = 0

                    case 4:

                        $step = 4

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] != 0x0) {
                            $step = 6
                            continue
                        }
                        $start++

                        $step = 5

                    case 5:

                        $step = 5

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] != 0x0) {
                            $step = 6
                            parse(Buffer.from([ 0x0 ]), 0, 1)
                            continue
                        }
                        $start++

                        $step = 10
                        continue

                    case 6:


                    case 7:

                        $_ = 0
                        $step = 8
                        $bite = 1

                    case 8:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, object: null, parse }
                            }
                            $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                            $bite--
                        }

                        object.array[$i[0]] = $_


                    case 9:

                        $i[0]++
                        $step = 4
                        continue

                    case 10:

                        $step = 11

                    case 11:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }

                        object.sentry = $buffer[$start++]


                    case 12:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
