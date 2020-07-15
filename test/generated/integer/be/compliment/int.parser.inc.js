module.exports = function ({ parsers }) {
    parsers.inc.object = function () {


        return function (object, $step = 0) {
            let $_, $bite

            return function parse ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    object = {
                        value: 0
                    }

                    $step = 1

                case 1:

                    $_ = 0
                    $step = 2
                    $bite = 3

                case 2:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }
                        $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                        $bite--
                    }

                    object.value = $_ & 0x80000000 ? (0xffffffff - $_ + 1) * -1 : $_


                case 3:

                    return { start: $start, object: object, parse: null }
                }
            }
        }
    } ()
}
