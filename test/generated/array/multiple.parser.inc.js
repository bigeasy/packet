module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $I = []) {
                let $_, $bite, $index = 0, $buffers = []

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
                            nudge: 0,
                            first: [],
                            second: [],
                            sentry: 0
                        }

                    case 1:

                    case 2:

                        if ($start == $end) {
                            $step = 2
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.nudge = $buffer[$start++]

                    case 3:

                        $_ = 0
                        $bite = 1

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 4
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite--
                        }

                        $I[0] = $_

                    case 5:
                        {
                            const $length = Math.min($I[0] - $index, $end - $start)
                            $buffers.push($buffer.slice($start, $start + $length))
                            $index += $length
                            $start += $length
                        }

                        if ($index != $I[0]) {
                            $step = 5
                            return { start: $start, parse: $parse }
                        }

                        object.first = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                        $index = 0
                        $buffers = []

                    case 6:

                        $_ = 0
                        $bite = 1

                    case 7:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 7
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite--
                        }

                        $I[0] = $_

                    case 8:
                        {
                            const $length = Math.min($I[0] - $index, $end - $start)
                            $buffers.push($buffer.slice($start, $start + $length))
                            $index += $length
                            $start += $length
                        }

                        if ($index != $I[0]) {
                            $step = 8
                            return { start: $start, parse: $parse }
                        }

                        object.second = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                        $index = 0
                        $buffers = []

                    case 9:

                    case 10:

                        if ($start == $end) {
                            $step = 10
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]

                    }

                    return { start: $start, object: object, parse: null }
                }
            }
        } ()
    }
}
