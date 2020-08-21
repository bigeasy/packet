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
                            $_ = object.type

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

                            switch (($ => $.type)(object)) {
                            case 0:

                                $step = 3
                                continue

                            default:

                                $step = 5
                                continue
                            }

                        case 3:

                            $bite = 0
                            $_ = object.array.length

                        case 4:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 4
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }
                            $step = 7
                            continue

                        case 5:

                            $bite = 1
                            $_ = object.array.length

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

                            const $bytes = Math.min($end - $start, object.array.length - $copied)
                            object.array.copy($buffer, $start, $copied, $copied + $bytes)
                            $copied += $bytes
                            $start += $bytes

                            if ($copied != object.array.length) {
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
