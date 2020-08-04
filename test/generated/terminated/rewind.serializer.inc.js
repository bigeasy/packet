module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $bite

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
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }


                        case 2:

                            $_ = 0

                        case 3: {

                                $step = 3

                                const length = Math.min($end - $start, object.array.length - $_)
                                object.array.copy($buffer, $start, $_, $_ + length)
                                $start += length
                                $_ += length

                                if ($_ != object.array.length) {
                                    return { start: $start, serialize: $serialize }
                                }

                                $step = 4

                            }

                        case 4:

                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x61

                            $step = 5

                        case 5:

                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x62

                            $step = 6

                        case 6:

                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x63

                            $step = 7

                        case 7:

                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x61

                            $step = 8

                        case 8:

                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x62

                            $step = 9

                        case 9:

                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x64

                            $step = 10

                        case 10:

                            $step = 11
                            $bite = 0
                            $_ = object.sentry

                        case 11:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }


                            $step = 12

                        case 12:

                            break

                        }

                        break
                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
