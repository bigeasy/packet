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
                            sentry: []
                        }

                        $step = 1

                    case 1:

                        $_ = 0

                        $step = 2

                    case 2: {

                        const length = Math.min($end - $start, 8 - $_)
                        $buffer.copy(object.array, $_, $start, $start + length)
                        $start += length
                        $_ += length

                        if ($_ != 8) {
                            return { start: $start, parse }
                        }

                        $step = 3

                    }

                    case 3:

                        $i[0] = 0

                    case 4:

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] == 0x0) {
                            $start++
                            $step = 9
                            continue
                        }

                        $step = 5

                    case 5:


                    case 6:

                        $step = 7

                    case 7:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }

                        object.sentry[$i[0]] = $buffer[$start++]


                    case 8:

                        $i[0]++
                        $step = 4
                        continue

                    case 9:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
