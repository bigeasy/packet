module.exports = function ({ parsers }) {
    parsers.inc.object = function () {


        return function (object = {}, $step = 0, $i = [], $I = []) {
            let $_, $bite, $index = 0, $buffers = []

            return function parse ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        object = {
                            type: 0,
                            array: [],
                            sentry: 0
                        }

                        $step = 1

                    case 1:

                        $step = 2

                    case 2:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }

                        object.type = $buffer[$start++]


                    case 3:

                        $step = 4

                    case 4:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }

                        $I[0] = $buffer[$start++]


                        $step = 5

                    case 5:

                        const $length = Math.min($I[0] - $index, $end - $start)
                        $buffers.push($buffer.slice($start, $start + $length))
                        $index += $length
                        $start += $length

                        if ($index != $I[0]) {
                            return { start: $start, parse }
                        }

                        object.array = $buffers

                        $index = 0
                        $buffers = []

                        $step = 6


                    case 6:

                        if ((($ => $.type == 0)(object))){
                            $step = 7
                            continue
                        } else {
                            $step = 9
                            continue
                        }

                    case 7:

                        $step = 8

                    case 8:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }

                        object.sentry = $buffer[$start++]


                        $step = 11
                        continue

                    case 9:

                        $_ = 0
                        $step = 10
                        $bite = 1

                    case 10:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, object: null, parse }
                            }
                            $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                            $bite--
                        }

                        object.sentry = $_



                    case 11:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
