module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $I = []) {
                let $_, $bite, $copied = 0, $offset = 0, $index = 0

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

                            $I[0] = object.array.reduce((sum, buffer) => sum + buffer.length, 0)

                        case 3:

                            switch (($ => $.type)(object)) {
                            case 0:

                                $step = 4
                                continue

                            default:

                                $step = 6
                                continue
                            }

                        case 4:

                            $bite = 0
                            $_ = $I[0]

                        case 5:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 5
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }
                            $step = 8
                            continue

                        case 6:

                            $bite = 1
                            $_ = $I[0]

                        case 7:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 7
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                            $_ = 0

                        case 8: {

                            for (;;) {
                                const $bytes = Math.min($end - $start, object.array[$index].length - $offset)
                                object.array[$index].copy($buffer, $start, $offset, $offset + $bytes)
                                $copied += $bytes
                                $offset += $bytes
                                $start += $bytes

                                if ($offset == object.array[$index].length) {
                                    $index++
                                    $offset = 0
                                }

                                if ($copied == $I[0]) {
                                    break
                                }

                                if ($start == $end) {
                                    $step = 8
                                    return { start: $start, serialize: $serialize }
                                }
                            }

                            $index = 0
                            $offset = 0
                            $copied = 0

                        }

                        case 9:

                            $bite = 0
                            $_ = object.sentry

                        case 10:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 10
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
