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
