module.exports = function ({ parsers }) {
    parsers.inc.object = function () {


        return function (object = {}, $step = 0, $i = []) {
            let $_, $bite, $buffers = [], $length = 0

            return function parse ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        object = {
                            array: Buffer.alloc(8),
                            sentry: 0
                        }

                        $step = 1

                    case 1:

                        $_ = 0

                        $step = 2

                    case 2: {

                        const $index = $buffer.indexOf(0xa, $start)
                        if (~$index) {
                            if ($_ + $index > 8) {
                                const $length = 8 - $_
                                $buffers.push($buffer.slice($start, $start + $length))
                                $_ += $length
                                $start += $length
                                $step = 4
                                continue
                            } else {
                                $buffers.push($buffer.slice($start, $index))
                                $_ += ($index - $start) + 1
                                $start = $index + 1
                                $step = 3
                                continue
                            }
                        } else if ($_ + ($end - $start) >= 8) {
                            const $length = 8 - $_
                            $buffers.push($buffer.slice($start, $start + $length))
                            $_ += $length
                            $start += $length
                            $step = 4
                            continue
                        } else {
                            $_ += $end - $start
                            $buffers.push($buffer.slice($start))
                            return { start: $end, parse }
                        }

                        $step = 3

                    }


                    case 3:

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start++] != 0xb) {
                            $buffers.push(Buffer.from([ 10 ].concat($buffer[$start])))
                            $step = 2
                            continue
                        }

                        $step = 4

                    case 4:

                        $_ = 8 -  Math.min($buffers.reduce((sum, buffer) => {
                            return sum + buffer.length
                        }, 2), 8)

                        object.array = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                        $buffers.length = 0

                        $step = 5

                    case 5: {

                        const length = Math.min($_, $end - $start)
                        $start += length
                        $_ -= length

                        if ($_ != 0) {
                            return { start: $start, parse }
                        }

                        $step = 6

                    }

                    case 6:

                        $step = 7

                    case 7:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }

                        object.sentry = $buffer[$start++]


                    case 8:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
