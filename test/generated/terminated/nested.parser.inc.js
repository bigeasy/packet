module.exports = function ({ parsers }) {
    parsers.inc.object = function () {


        return function (object, $step = 0, $i = []) {
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

                        $step = 16
                        continue

                    case 6:

                        object.array[$i[0]] = []

                    case 7:

                        $i[1] = 0

                    case 8:

                        $step = 8

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] != 0x0) {
                            $step = 10
                            continue
                        }
                        $start++

                        $step = 9

                    case 9:

                        $step = 9

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] != 0x0) {
                            $step = 10
                            parse(Buffer.from([ 0x0 ]), 0, 1)
                            continue
                        }
                        $start++

                        $step = 14
                        continue

                    case 10:


                    case 11:

                        $_ = 0
                        $step = 12
                        $bite = 1

                    case 12:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, object: null, parse }
                            }
                            $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                            $bite--
                        }

                        object.array[$i[0]][$i[1]] = $_


                    case 13:

                        $i[1]++
                        $step = 8
                        continue

                    case 14:

                        // Here
                        $step = 14

                    case 15:

                        $i[0]++
                        $step = 4
                        continue

                    case 16:

                        // Here
                        $step = 16

                    case 17:

                        $step = 18

                    case 18:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }

                        object.sentry = $buffer[$start++]


                    case 19:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
