module.exports = function ({ parsers }) {
    parsers.inc.object = function () {


        return function (object = {}, $step = 0, $i = []) {
            let $_, $bite

            return function parse ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        object = {
                            array: [],
                            sentry: []
                        }

                        $step = 1

                    case 1:

                        $i[0] = 0

                    case 2:

                    case 3:

                        $_ = 0
                        $step = 4
                        $bite = 1

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, object: null, parse }
                            }
                            $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                            $bite--
                        }

                        object.array[$i[0]] = $_


                    case 5:

                        $i[0]++

                        if ($i[0] == 4) {
                            $step = 6
                            continue
                        }

                        $step = 2
                        continue

                    case 6:

                        $_ = (4 - $i[0]) * 2 - 0
                        $step = 7

                    case 7:

                        $bite = Math.min($end - $start, $_)
                        $_ -= $bite
                        $start += $bite

                        if ($_ != 0) {
                            return { start: $start, object: null, parse }
                        }

                        $step = 8

                    case 8:

                        $i[0] = 0

                    case 9:

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start] != 0x0) {
                            $step = 10
                            parse([  ], 0, 0)
                            continue
                        }
                        $start++

                        $step = 14
                        continue

                    case 10:


                    case 11:

                        $step = 12

                    case 12:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }

                        object.sentry[$i[0]] = $buffer[$start++]


                    case 13:

                        $i[0]++
                        $step = 9
                        continue

                    case 14:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
