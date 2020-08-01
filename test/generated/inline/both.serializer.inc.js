module.exports = function ({ serializers, $lookup }) {
    serializers.inc.object = function () {
        return function (object, $step = 0, $$ = []) {
            let $_, $bite

            return function $serialize ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    $$[0] = (value => -value)(object.value)

                case 1:

                    $step = 2
                    $bite = 1
                    $_ = $$[0]

                case 2:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize: $serialize }
                        }
                        $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                        $bite--
                    }


                case 3:

                    $step = 4
                    $bite = 0
                    $_ = object.sentry

                case 4:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize: $serialize }
                        }
                        $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                        $bite--
                    }


                    $step = 5

                case 5:

                    break

                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
