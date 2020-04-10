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

                    $_ = 0
                    $step = 4
                    $byte = 1

                case 4:

                    while ($byte != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += $buffer[$start++] << $byte * 8 >>> 0
                        $byte--
                    }

                    object.array[$i[0]] = $_

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
