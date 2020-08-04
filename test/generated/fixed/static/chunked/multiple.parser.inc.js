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

                            $step = 4

                        case 4: {

                            const $index = $buffer.indexOf(0xd, $start)
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
                                $_ += $end - $start
                                $buffers.push($buffer.slice($start))
                                return { start: $end, object: null, parse: $parse }
                            }

                            $step = 5

                        }


                        case 5:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start++] != 0xa) {
                                if ($buffer[$start - 1] == 0xd) {
                                    $buffers.push(Buffer.from([ 0xd ]))
                                    $step = 5
                                    continue
                                }
                                $buffers.push(Buffer.from([ 0xd ].concat($buffer[$start - 1])))
                                $step = 4
                                continue
                            }

                            $step = 6

                        case 6:

                            $_ = 8 -  Math.min($buffers.reduce((sum, buffer) => {
                                return sum + buffer.length
                            }, 2), 8)

                            object.array = $buffers
                            $buffers = []

                            $step = 7

                        case 7: {

                            const length = Math.min($_, $end - $start)
                            $start += length
                            $_ -= length

                            if ($_ != 0) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            $step = 8

                        }

                        case 8:

                            $step = 9

                        case 9:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.sentry = $buffer[$start++]


                        case 10:

                            return { start: $start, object: object, parse: null }
                        }
                        break
                    }
                }
            }
        } ()
    }
}
