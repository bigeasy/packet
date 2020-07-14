module.exports = function ({ serializers }) {
    serializers.inc.object = function () {


        return function (object, $step = 0, $i = []) {
            let $_, $bite, $copied = 0

            return function serialize ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        $step = 1
                        $bite = 0
                        $_ = object.array.length

                    case 1:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                    case 2: {

                        const $bytes = Math.min($end - $start, object.array.length - $copied)
                        object.array.copy($buffer, $start, $copied, $copied + $bytes)
                        $copied += $bytes
                        $start += $bytes

                        if ($copied != object.array.length) {
                            return { start: $start, serialize }
                        }

                        $copied = 0

                        $step = 3

                    }

                    case 3:

                        $step = 4
                        $bite = 0
                        $_ = object.sentry

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                        $step = 5

                    case 5:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
