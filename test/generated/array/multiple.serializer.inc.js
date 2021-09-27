module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite, $copied = 0

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

                            $bite = 1
                            $_ = object.first.length

                        case 3:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 3
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                        case 4: {

                            const $bytes = Math.min($end - $start, object.first.length - $copied)
                            object.first.copy($buffer, $start, $copied, $copied + $bytes)
                            $copied += $bytes
                            $start += $bytes

                            if ($copied != object.first.length) {
                                $step = 4
                                return { start: $start, serialize: $serialize }
                            }

                            $copied = 0

                        }

                        case 5:

                            $bite = 1
                            $_ = object.second.length

                        case 6:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 6
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                        case 7: {

                            const $bytes = Math.min($end - $start, object.second.length - $copied)
                            object.second.copy($buffer, $start, $copied, $copied + $bytes)
                            $copied += $bytes
                            $start += $bytes

                            if ($copied != object.second.length) {
                                $step = 7
                                return { start: $start, serialize: $serialize }
                            }

                            $copied = 0

                        }

                        case 8:

                            $bite = 0
                            $_ = object.sentry

                        case 9:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 9
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
