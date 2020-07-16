module.exports = function ({ serializers }) {
    serializers.inc.object = function () {
        return function (object, $step = 0) {
            let $_, $bite

            return function serialize ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    $step = 1
                    $bite = 0
                    $_ = object.word

                case 1:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }


                    $step = 2

                case 2:

                    break

                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
