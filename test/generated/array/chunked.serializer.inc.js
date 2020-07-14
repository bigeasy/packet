module.exports = function ({ serializers }) {
    serializers.inc.object = function () {


        return function (object, $step = 0, $i = []) {
            let $_, $bite, $copied = 0, $offset = 0, $index = 0, $length = 0

            return function serialize ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        $length = object.array.reduce((sum, buffer) => sum + buffer.length, 0)

                        $step = 1

                    case 1:

                        $step = 2
                        $bite = 0
                        $_ = $length

                    case 2:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                    case 3: {

                        do {
                            const $bytes = Math.min($end - $start, object.array[$index].length - $offset)
                            object.array[$index].copy($buffer, $start, $offset, $offset + $bytes)
                            $copied += $bytes
                            $offset += $bytes
                            $start += $bytes
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            if ($offset == object.array[$index].length) {
                                $index++
                                $offset = 0
                            }
                        } while ($copied != $length)

                        $index = 0
                        $copied = 0
                        $offset = 0

                        $step = 4

                    }

                    case 4:

                        $step = 5
                        $bite = 0
                        $_ = object.sentry

                    case 5:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                        $step = 6

                    case 6:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
