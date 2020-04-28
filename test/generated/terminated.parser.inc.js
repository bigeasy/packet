module.exports = function (parsers) {
    parsers.inc.object = function (object = {}, $step = 0, $i = [], $I = []) {
        let $_, $byte
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
                        parse([ 0x0 ], 0, index)
                        continue
                    }
                    $start++

                    $step = 6
                    continue
                case 4:

                    $_ = 0
                    $step = 5
                    $byte = 1

                case 5:

                    while ($byte != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += $buffer[$start++] << $byte * 8 >>> 0
                        $byte--
                    }

                    object.array[$i[0]] = $_

                    $i[0]++
                    $step = 2
                    continue

                case 6:

                    return { start: $start, object: object, parse: null }
                }
                break
            }
        }
    }
}
