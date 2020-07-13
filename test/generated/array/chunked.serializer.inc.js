module.exports = function ({ serializers }) {
    serializers.inc.object = function () {


        return function (object, $step = 0, $i = []) {
            let $_, $bite, $copied = 0, $offset = 0, $index = 0, $length = 0

            return function serialize ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        $step = 1
                        $bite = 0
                        $_ = object.type

                    case 1:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
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
                                return { start: $start, serialize }
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

                        $step = 6

                    }

                    case 6:

                        if (($ => $.type == 0)(object)){
                            $step = 7
                            continue
                        } else {
                            $step = 9
                            continue
                        }

                    case 7:

                        $step = 8
                        $bite = 0
                        $_ = object.sentry

                    case 8:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        $step = 11
                        continue

                    case 9:

                        $step = 10
                        $bite = 1
                        $_ = object.sentry

                    case 10:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        $step = 11

                    case 11:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
