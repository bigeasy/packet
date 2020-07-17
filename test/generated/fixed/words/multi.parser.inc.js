module.exports = function ({ parsers, $lookup }) {
    parsers.inc.object = function () {
        return function (object, $step = 0, $i = []) {
            let $_, $bite, $length = 0

            return function $parse ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        object = {
                            array: [],
                            sentry: 0
                        }

                        $step = 1

                    case 1:

                        $i[0] = 0

                    case 2:

                        $step = 2

                        if ($i[0] == 16) {
                            $step = 8
                            continue
                        }

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        if ($buffer[$start] != 0xd) {
                            $step = 4
                            continue
                        }
                        $start++

                        $step = 3

                    case 3:

                        $step = 3

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        if ($buffer[$start] != 0xa) {
                            $step = 4
                            $parse(Buffer.from([ 0xd ]), 0, 1)
                            continue
                        }
                        $start++

                        $step = 8
                        continue

                    case 4:


                    case 5:

                        $step = 6

                    case 6:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.array[$i[0]] = $buffer[$start++]


                    case 7:

                        $i[0]++
                        $step = 2
                        continue

                    case 8:

                        $_ = 16 != $i[0]
                            ? (16 - $i[0]) * 1 - 2
                            : 0

                        $step = 9

                    case 9: {

                        const length = Math.min($_, $end - $start)
                        $start += length
                        $_ -= length

                        if ($_ != 0) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        $step = 10

                    }

                    case 10:

                        $step = 11

                    case 11:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]


                    case 12:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
