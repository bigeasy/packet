module.exports = function (parsers) {
    parsers.inc.object = function (object = {}, $step = 0) {
        let $_, $byte
        return function parse ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                object = {
                    word: 0
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

                object.word = $_ & 0x8000 ? (0xffff - $_  + 1) * -1 : $_


            case 3:

                return { start: $start, object: object, parse: null }
            }
        }
    }
}
