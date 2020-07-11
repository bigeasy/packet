module.exports = function ({ parsers }) {
    parsers.inc.object = function () {


        return function (object = {}, $step = 0, $i = []) {
            let $_, $bite

            return function parse ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        object = {
                            value: [],
                            sentry: 0
                        }

                        $step = 1

                    case 1:

                        $i[0] = 0

                    case 2:

                    case 3:

                        $step = 4

                    case 4:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }

                        object.value[$i[0]] = $buffer[$start++]


                    case 5:

                        $i[0]++

                        if ($i[0] != 8) {
                            $step = 3
                            continue
                        }

                        $_ = (8 - $i[0]) * 1 - 0
                        $step = 6

                    case 6:

                        $bite = Math.min($end - $start, $_)
                        $_ -= $bite
                        $start += $bite

                        if ($_ != 0) {
                            return { start: $start, object: null, parse }
                        }

                        $step = 7
                        object.value = (function (value) {
                            return Buffer.from(value).readDoubleLE()
                        })(object.value)

                    case 7:

                        $step = 8

                    case 8:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
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
