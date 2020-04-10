module.exports = function (parsers) {
    parsers.inc.object = function (object = {}, $step = 0, $i = [], $I = []) {
        let $_, $byte
        return function parse ($buffer, $start, $end) {
            for (;;) {
                switch ($step) {
                case 0:

                    object = {
                        array: new Array
                    }
                    $step = 1

                case 1:

                    $_ = 0
                    $step = 2
                    $byte = 1

                case 2:

                    while ($byte != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += $buffer[$start++] << $byte * 8 >>> 0
                        $byte--
                    }

                    $I[0] = $_

                    $i[0] = 0

                case 3:

                    object.array[$i[0]] = {
                        first: new Array
                    }
                    $step = 4

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

                    $I[1] = $_

                    $i[1] = 0

                case 6:

                    $_ = 0
                    $step = 7
                    $byte = 1

                case 7:

                    while ($byte != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += $buffer[$start++] << $byte * 8 >>> 0
                        $byte--
                    }

                    object.array[$i[0]].first[$i[1]] = $_

                    if (++$i[1] != $I[1]) {
                        $step = 6
                        continue
                    }
                    if (++$i[0] != $I[0]) {
                        $step = 3
                        continue
                    }
                    return { start: $start, object: object, parse: null }
                }
                break
            }
        }
    }
}
