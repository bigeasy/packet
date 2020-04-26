module.exports = function (serializers) {
    serializers.inc.object = function (object, $step = 0, $i = []) {
        let $byte, $stop, $_

        return function serialize ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                $step = 1
                $byte = 0
                $_ = object.word

            case 1:

                while ($byte != 4) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = $_ >>> $byte * 8 & 0xff
                    $byte++
                }


                $step = 2

            case 2:

                break

            }

            return { start: $start, serialize: null }
        }
    }
}
