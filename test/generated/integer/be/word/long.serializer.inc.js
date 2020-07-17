module.exports = function ({ serializers, $lookup }) {
    serializers.inc.object = function () {
        return function (object, $step = 0) {
            let $_, $bite

            return function $serialize ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    $step = 1
                    $bite = 7n
                    $_ = object.value

                case 1:

                    while ($bite != -1n) {
                        if ($start == $end) {
                            return { start: $start, serialize: $serialize }
                        }
                        $buffer[$start++] = Number($_ >> $bite * 8n & 0xffn)
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
