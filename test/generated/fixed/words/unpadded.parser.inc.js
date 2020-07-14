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
                            sentry: 0
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

                        if ($i[0] != 4) {
                            $step = 3
                            continue
                        }

                        $_ = (4 - $i[0]) * 2 - 0
                        $step = 6


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
