module.exports = function (parsers) {
    parsers.inc.object = function (object = {}, $step = 0) {
        let $_, $byte
        return function parse ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                object = {
                    padded: 0
                }
                $step = 1

            case 1:

                $_ = 3
                $step = 2

            case 2:

                $byte = Math.min($end - $start, $_)
                $_ -= $byte
                $start += $byte

                if ($_ != 0) {
                    return { start: $start, object: null, parse }
                }

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

                object.padded = $_


            case 5:

                $_ = 3
                $step = 6

            case 6:

                $byte = Math.min($end - $start, $_)
                $_ -= $byte
                $start += $byte

                if ($_ != 0) {
                    return { start: $start, object: null, parse }
                }

            case 7:

                return { start: $start, object: object, parse: null }
            }
        }
    }
}
