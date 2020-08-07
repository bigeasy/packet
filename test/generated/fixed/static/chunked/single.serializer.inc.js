module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $bite, $offset = 0, $length = 0, $index = 0

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            $bite = 0
                            $_ = object.nudge

                        case 1:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 1
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }


                        case 2:

                            $_ = 0
                            $length = object.array.reduce((sum, buffer) => sum + buffer.length, 0)

                        case 3: {

                            for (;;) {
                                const $bytes = Math.min($end - $start, object.array[$index].length - $offset)
                                object.array[$index].copy($buffer, $start, $offset, $offset + $bytes)
                                $offset += $bytes
                                $start += $bytes
                                $_ += $bytes

                                if ($offset == object.array[$index].length) {
                                    $index++
                                    $offset = 0
                                }

                                if ($_ == $length) {
                                    break
                                }

                                if ($start == $end) {
                                    $step = 3
                                    return { start: $start, serialize: $serialize }
                                }
                            }

                            $index = 0
                            $offset = 0

                        }

                        case 4:

                            $_ = 8 - $_

                        case 5: {

                            const length = Math.min($end - $start, $_)
                            $buffer.fill(0x0, $start, $start + length)
                            $start += length
                            $_ -= length

                            if ($_ != 0) {
                                $step = 5
                                return { start: $start, serialize: $serialize }
                            }

                        }

                        case 6:

                            $bite = 0
                            $_ = object.sentry

                        case 7:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 7
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                        }

                        break
                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
