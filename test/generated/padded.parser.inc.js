module.exports = function (parsers) {
    const $Buffer = Buffer

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

                case 2:

                    if (16 - $i[0] < 2) {
                        $step = 8
                        continue
                    }

                    if ($start == $end) {
                        return { start: $start, parse }
                    }

                    if ($buffer[$start] != 0xd) {
                        $step = 4
                        continue
                    }
                    $start++

                    $step = 3

                case 3:

                    if ($start == $end) {
                        return { start: $start, parse }
                    }

                    if ($buffer[$start] != 0xa) {
                        $step = 4
                        parse([ 0xd ], 0, 1)
                        continue
                    }
                    $start++

                    $step = 8
                    continue

                case 4:


                case 5:

                    $step = 6

                case 6:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    object.array[$i[0]] = $buffer[$start++]


                case 7:

                    $i[0]++

                    if ($i[0] == 16) {
                        $step = 8
                        continue
                    }

                    $step = 2
                    continue

                case 8:

                    $_ = (16 - $i[0]) * 1 - 2
                    $step = 9

                case 9:

                    $bite = Math.min($end - $start, $_)
                    $_ -= $bite
                    $start += $bite

                    if ($_ != 0) {
                        return { start: $start, object: null, parse }
                    }

                    $step = 10

                case 10:

                    return { start: $start, object: object, parse: null }
                }
                break
            }
        }
    }
}
