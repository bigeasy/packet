module.exports = function (serializers) {
    serializers.inc.object = function (object, $step = 0, $i = []) {
        let $byte, $stop, $_

        return function serialize ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                $step = 1
                $byte = 0
                $_ = [15,173,237]

            case 1:

                while ($byte != 3) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = $_[$byte++]
                }


            case 2:

                $step = 3
                $byte = 1
                $_ = object.padded

            case 3:

                while ($byte != -1) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = $_ >>> $byte * 8 & 0xff
                    $byte--
                }


            case 4:

                $step = 5
                $byte = 0
                $_ = [250,202,222]

            case 5:

                while ($byte != 3) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = $_[$byte++]
                }


                $step = 6

            case 6:

                break

            }

            return { start: $start, serialize: null }
        }
    }
}
