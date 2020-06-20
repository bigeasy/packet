module.exports = function (serializers) {
    serializers.inc.object = function (object, $step = 0) {
        let $bite, $stop, $_

        return function serialize ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                $step = 1
                $bite = 0
                $_ = [15,173,237]

            case 1:

                while ($bite != 3) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = $_[$bite++]
                }


            case 2:

                $step = 3
                $bite = 1
                $_ = object.padded

            case 3:

                while ($bite != -1) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                    $bite--
                }


            case 4:

                $step = 5
                $bite = 0
                $_ = [250,202,222]

            case 5:

                while ($bite != 3) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = $_[$bite++]
                }


            case 6:

                $step = 7
                $bite = 0
                $_ = object.sentry

            case 7:

                while ($bite != -1) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                    $bite--
                }


                $step = 8

            case 8:

                break

            }

            return { start: $start, serialize: null }
        }
    }
}
