module.exports = function ({ serializers, $lookup }) {
    serializers.inc.object = function () {
        return function (object, $step = 0, $i = []) {
            let $_, $bite, $copied = 0, $offset = 0, $index = 0, $length = 0

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

                        $length = object.array.reduce((sum, buffer) => sum + buffer.length, 0)

                        $step = 3

                    case 3:

                        $step = 4
                        $bite = 0
                        $_ = $length

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                    case 5: {

                        do {
                            const $bytes = Math.min($end - $start, object.array[$index].length - $offset)
                            object.array[$index].copy($buffer, $start, $offset, $offset + $bytes)
                            $copied += $bytes
                            $offset += $bytes
                            $start += $bytes
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            if ($offset == object.array[$index].length) {
                                $index++
                                $offset = 0
                            }
                        } while ($copied != $length)

                        $index = 0
                        $copied = 0
                        $offset = 0

                        $step = 6

                    }

                    case 6:

                        $step = 7
                        $bite = 0
                        $_ = object.sentry

                    case 7:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                        $step = 8

                    case 8:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
