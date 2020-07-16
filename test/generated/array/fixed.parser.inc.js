module.exports = function ({ parsers }) {
    parsers.inc.object = function () {
        return function (object, $step = 0, $i = [], $I = []) {
            let $_, $bite

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

                        $_ = 0
                        $step = 2
                        $bite = 1

                    case 2:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                            $bite--
                        }

                        $I[0] = $_

                        $i[0] = 0
                    case 3:

                        object.array[$i[0]] = {
                            first: 0,
                            second: 0
                        }

                    case 4:

                        $_ = 0
                        $step = 5
                        $bite = 1

                    case 5:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                            $bite--
                        }

                        object.array[$i[0]].first = $_


                    case 6:

                        $_ = 0
                        $step = 7
                        $bite = 1

                    case 7:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                            $bite--
                        }

                        object.array[$i[0]].second = $_

                        if (++$i[0] != $I[0]) {
                            $step = 3
                            continue
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
