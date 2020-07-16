module.exports = function ({ serializers }) {
    serializers.inc.object = function () {
        return function (object, $step = 0) {
            let $_, $bite

            return function serialize ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    $step = 1
                    $bite = 0n
                    $_ = object.value

                case 1:

                    while ($bite != 8n) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = Number($_ >> $bite * 8n & 0xffn)
                        $bite++
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
