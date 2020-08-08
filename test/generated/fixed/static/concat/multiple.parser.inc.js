module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $bite, $buffers = [], $length = 0

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                nudge: 0,
                                array: null,
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

                        case 4: {

                            const $index = $buffer.indexOf(0xa, $start)
                            if (~$index) {
                                if ($_ + $index > 8) {
                                    const $length = 8 - $_
                                    $buffers.push($buffer.slice($start, $start + $length))
                                    $_ += $length
                                    $start += $length
                                    $step = 6
                                    continue
                                } else {
                                    $buffers.push($buffer.slice($start, $index))
                                    $_ += ($index - $start) + 1
                                    $start = $index + 1
                                    $step = 5
                                    continue
                                }
                            } else if ($_ + ($end - $start) >= 8) {
                                const $length = 8 - $_
                                $buffers.push($buffer.slice($start, $start + $length))
                                $_ += $length
                                $start += $length
                                $step = 6
                                continue
                            } else {
                                $step = 4
                                $_ += $end - $start
                                $buffers.push($buffer.slice($start))
                                return { start: $end, object: null, parse: $parse }
                            }

                        }


                        case 5:

                            if ($start == $end) {
                                $step = 5
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start++] != 0xb) {
                                if ($buffer[$start - 1] == 0xa) {
                                    $buffers.push(Buffer.from([ 0xa ]))
                                    $step = 5
                                    continue
                                }
                                $buffers.push(Buffer.from([ 0xa ].concat($buffer[$start - 1])))
                                $step = 4
                                continue
                            }

                        case 6:

                            $_ = 8 -  Math.min($buffers.reduce((sum, buffer) => {
                                return sum + buffer.length
                            }, 2), 8)

                            object.array = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                            $buffers.length = 0

                        case 7: {

                            const length = Math.min($_, $end - $start)
                            $start += length
                            $_ -= length

                            if ($_ != 0) {
                                $step = 7
                                return { start: $start, object: null, parse: $parse }
                            }

                        }

                        case 8:

                        case 9:

                            if ($start == $end) {
                                $step = 9
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.sentry = $buffer[$start++]

                        }

                        return { start: $start, object: object, parse: null }
                        break
                    }
                }
            }
        } ()
    }
}
