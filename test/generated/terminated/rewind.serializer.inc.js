module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $bite

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

                        case 3: {

                                const length = Math.min($end - $start, object.array.length - $_)
                                object.array.copy($buffer, $start, $_, $_ + length)
                                $start += length
                                $_ += length

                                if ($_ != object.array.length) {
                                    $step = 3
                                    return { start: $start, serialize: $serialize }
                                }

                            }

                        case 4:

                            if ($start == $end) {
                                $step = 4
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x61

                        case 5:

                            if ($start == $end) {
                                $step = 5
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x62

                        case 6:

                            if ($start == $end) {
                                $step = 6
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x63

                        case 7:

                            if ($start == $end) {
                                $step = 7
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x61

                        case 8:

                            if ($start == $end) {
                                $step = 8
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x62

                        case 9:

                            if ($start == $end) {
                                $step = 9
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x64

                        case 10:

                            $bite = 0
                            $_ = object.sentry

                        case 11:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 11
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
