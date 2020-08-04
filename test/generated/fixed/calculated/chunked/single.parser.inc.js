module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = [], $I = []) {
                let $_, $bite, $buffers = []

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                nudge: 0,
                                array: null,
                                sentry: 0
                            }

                            $step = 1

                        case 1:

                            $step = 2

                        case 2:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.nudge = $buffer[$start++]


                        case 3:

                            $_ = 0
                            $I[0] = (() => 8)()

                            $step = 4

                        case 4: {

                            const $index = $buffer.indexOf(0x0, $start)
                            if (~$index) {
                                if ($_ + $index > $I[0]) {
                                    const $length = $I[0] - $_
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $_ += $length
                                    $start += $length
                                    $step = 5
                                    continue
                                } else {
                                    $buffers.push($buffer.slice($start, $index))
                                    $_ += ($index - $start) + 1
                                    $start = $index + 1
                                    $step = 5
                                    continue
                                }
                            } else if ($_ + ($end - $start) >= $I[0]) {
                                const $length = $I[0] - $_
                                $buffers.push($buffer.slice($start, $start + $length))
                                $_ += $length
                                $start += $length
                                $step = 5
                                continue
                            } else {
                                $_ += $end - $start
                                $buffers.push($buffer.slice($start))
                                return { start: $end, object: null, parse: $parse }
                            }

                            $step = 5

                        }


                        case 5:

                            $_ = $I[0] -  Math.min($buffers.reduce((sum, buffer) => {
                                return sum + buffer.length
                            }, 1), $I[0])

                            object.array = $buffers
                            $buffers = []

                            $step = 6

                        case 6: {

                            const length = Math.min($_, $end - $start)
                            $start += length
                            $_ -= length

                            if ($_ != 0) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            $step = 7

                        }

                        case 7:

                            $step = 8

                        case 8:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.sentry = $buffer[$start++]


                        case 9:

                            return { start: $start, object: object, parse: null }
                        }
                        break
                    }
                }
            }
        } ()
    }
}
