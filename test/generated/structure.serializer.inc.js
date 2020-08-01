module.exports = function ({ serializers, $lookup }) {
    serializers.inc.object = function () {
        return function (object, $step = 0) {
            let $_, $bite

            return function $serialize ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    $step = 1
                    $bite = 0
                    $_ = object.value.first

                case 1:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize: $serialize }
                        }
                        $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                        $bite--
                    }


                case 2:

                    $step = 3
                    $bite = 0
                    $_ = object.value.second

                case 3:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize: $serialize }
                        }
                        $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                        $bite--
                    }


                case 4:

                    $step = 5
                    $bite = 0
                    $_ = object.sentry

                case 5:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize: $serialize }
                        }
                        $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                        $bite--
                    }


                    $step = 6

                case 6:

                    break

                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
