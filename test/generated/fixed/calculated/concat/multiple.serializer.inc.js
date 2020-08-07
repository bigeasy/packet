module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = [], $I = []) {
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
                            $I[0] = (() => 8)()

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

                            if ($_++ == $I[0] * 1) {
                                $step = 6
                                continue
                            }

                            $buffer[$start++] = 0xa

                        case 5:

                            if ($start == $end) {
                                $step = 5
                                return { start: $start, serialize: $serialize }
                            }

                            if ($_++ == $I[0] * 1) {
                                $step = 6
                                continue
                            }

                            $buffer[$start++] = 0xb

                            if ($_ != $I[0] * 1) {
                                $step = 4
                                continue
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
