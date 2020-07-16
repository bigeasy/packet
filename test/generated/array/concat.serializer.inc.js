module.exports = function ({ serializers }) {
    serializers.inc.object = function () {
        return function (object, $step = 0, $i = []) {
            let $_, $bite, $copied = 0

            return function $serialize ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        $step = 1
                        $bite = 0
                        $_ = object.nudge

                    case 1:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                    case 2:

                        $step = 3
                        $bite = 0
                        $_ = object.array.length

                    case 3:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                    case 4: {

                        const $bytes = Math.min($end - $start, object.array.length - $copied)
                        object.array.copy($buffer, $start, $copied, $copied + $bytes)
                        $copied += $bytes
                        $start += $bytes

                        if ($copied != object.array.length) {
                            return { start: $start, serialize: $serialize }
                        }

                        $copied = 0

                        $step = 5

                    }

                    case 5:

                        $step = 6
                        $bite = 0
                        $_ = object.sentry

                    case 6:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                        $step = 7

                    case 7:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
