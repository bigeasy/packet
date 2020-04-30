module.exports = function (parsers) {
    parsers.inc.object = function (object = {}, $step = 0, $i = []) {
        let $_, $bite
        return function parse ($buffer, $start, $end) {
            for (;;) {
                switch ($step) {
                case 0:

                    object = {
                        array: []
                    }
                    $step = 1

                case 1:

                    $i[0] = 0
                    $step = 2

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

                    $step = 11
                    continue
                case 4:

                    $i[1] = 0
                    object.array[$i[0]] = []
                    $step = 5

                case 5:

                    if ($start == $end) {
                        return { start: $start, parse }
                    }

                    if ($buffer[$start] != 0x0) {
                        $step = 7
                        continue
                    }
                    $start++

                    $step = 6

                case 6:

                    if ($start == $end) {
                        return { start: $start, parse }
                    }

                    if ($buffer[$start] != 0x0) {
                        $step = 7
                        parse([ 0x0 ], 0, 1)
                        continue
                    }
                    $start++

                    $step = 10
                    continue
                case 7:

                    $_ = 0
                    $step = 8
                    $bite = 1

                case 8:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += $buffer[$start++] << $bite * 8 >>> 0
                        $bite--
                    }

                    object.array[$i[0]][$i[1]] = $_


                case 9:

                    $i[1]++
                    $step = 5
                    continue

                case 10:

                    $i[0]++
                    $step = 2
                    continue

                case 11:

                    return { start: $start, object: object, parse: null }
                }
                break
            }
        }
    }
}
