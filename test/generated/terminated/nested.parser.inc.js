module.exports = function (parsers) {
    parsers.inc.object = function (object = {}, $step = 0, $i = []) {
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

                    if ($buffer[$start] != 0x0) {
                        $step = 4
                        continue
                    }
                    $start++

                    $step = 3

                case 3:

                    if ($start == $end) {
                        return { start: $start, parse }
                    }

                    if ($buffer[$start] != 0x0) {
                        $step = 4
                        parse([ 0x0 ], 0, 1)
                        continue
                    }
                    $start++

                    $step = 13
                    continue

                case 4:

                    object.array[$i[0]] = []

                case 5:

                    $i[1] = 0

                case 6:

                    if ($start == $end) {
                        return { start: $start, parse }
                    }

                    if ($buffer[$start] != 0x0) {
                        $step = 8
                        continue
                    }
                    $start++

                    $step = 7

                case 7:

                    if ($start == $end) {
                        return { start: $start, parse }
                    }

                    if ($buffer[$start] != 0x0) {
                        $step = 8
                        parse([ 0x0 ], 0, 1)
                        continue
                    }
                    $start++

                    $step = 12
                    continue

                case 8:


                case 9:

                    $_ = 0
                    $step = 10
                    $bite = 1

                case 10:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                        $bite--
                    }

                    object.array[$i[0]][$i[1]] = $_


                case 11:

                    $i[1]++
                    $step = 6
                    continue

                case 12:

                    $i[0]++
                    $step = 2
                    continue

                case 13:

                    $step = 14

                case 14:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    object.sentry = $buffer[$start++]


                case 15:

                    return { start: $start, object: object, parse: null }
                }
                break
            }
        }
    }
}
