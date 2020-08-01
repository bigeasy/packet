module.exports = function ({ parsers, $lookup }) {
    parsers.inc.object = function () {
        return function (object, $step = 0, $i = [], $accumulator = [], $starts = []) {
            let $_, $bite, $restart = false, $length = 0

            return function $parse ($buffer, $start, $end) {
                if ($restart) {
                    for (let $j = 0; $j < $starts.length; $j++) {
                        $starts[$j] = $start
                    }
                }
                $restart = true

                for (;;) {
                    switch ($step) {
                    case 0:

                        object = {
                            counted: {
                                length: 0,
                                string: [],
                                number: 0
                            },
                            sentry: 0
                        }

                        $step = 1

                    case 1:

                        $accumulator['counter'] = [ 0 ]

                    case 2:

                        $starts[0] = $start

                    case 3:

                        $_ = 0
                        $step = 4
                        $bite = 3

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                ; (function ({ $start, $end, counter }) {
                                    counter[0] += $end - $start
                                })({
                                    $start: $starts[0],
                                    $end: $start,
                                    counter: $accumulator['counter']
                                })
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite--
                        }

                        object.counted.length = $_


                    case 5:

                        $i[0] = 0

                    case 6:

                        $step = 6

                        if ($start == $end) {
                            ; (function ({ $start, $end, counter }) {
                                counter[0] += $end - $start
                            })({
                                $start: $starts[0],
                                $end: $start,
                                counter: $accumulator['counter']
                            })
                            return { start: $start, object: null, parse: $parse }
                        }

                        if ($buffer[$start] == 0x0) {
                            $start++
                            $step = 10
                            continue
                        }

                        $step = 7

                    case 7:

                        $step = 8

                    case 8:

                        if ($start == $end) {
                            ; (function ({ $start, $end, counter }) {
                                counter[0] += $end - $start
                            })({
                                $start: $starts[0],
                                $end: $start,
                                counter: $accumulator['counter']
                            })
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.counted.string[$i[0]] = $buffer[$start++]


                    case 9:

                        $i[0]++
                        $step = 6
                        continue

                    case 10:

                        // Here
                        $step = 10

                    case 11:

                        ; (function ({ $start, $end, counter }) {
                            counter[0] += $end - $start
                        })({
                            $start: $starts[0],
                            $end: $start,
                            counter: $accumulator['counter']
                        })
                        $starts[0] = $start

                        switch ((({ $, counter }) => $.counted.length - counter[0])({
                            $: object,
                            counter: $accumulator['counter']
                        })) {
                        case 1:

                            $step = 12
                            continue

                        case 2:

                            $step = 14
                            continue

                        default:

                            $step = 16
                            continue
                        }

                    case 12:

                        $step = 13

                    case 13:

                        if ($start == $end) {
                            ; (function ({ $start, $end, counter }) {
                                counter[0] += $end - $start
                            })({
                                $start: $starts[0],
                                $end: $start,
                                counter: $accumulator['counter']
                            })
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.counted.number = $buffer[$start++]

                        $step = 18
                        continue

                    case 14:

                        $_ = 0
                        $step = 15
                        $bite = 1

                    case 15:

                        while ($bite != -1) {
                            if ($start == $end) {
                                ; (function ({ $start, $end, counter }) {
                                    counter[0] += $end - $start
                                })({
                                    $start: $starts[0],
                                    $end: $start,
                                    counter: $accumulator['counter']
                                })
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite--
                        }

                        object.counted.number = $_

                        $step = 18
                        continue

                    case 16:

                        $_ = 0
                        $step = 17
                        $bite = 3

                    case 17:

                        while ($bite != -1) {
                            if ($start == $end) {
                                ; (function ({ $start, $end, counter }) {
                                    counter[0] += $end - $start
                                })({
                                    $start: $starts[0],
                                    $end: $start,
                                    counter: $accumulator['counter']
                                })
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite--
                        }

                        object.counted.number = $_


                        ; (function ({ $start, $end, counter }) {
                            counter[0] += $end - $start
                        })({
                            $start: $starts[0],
                            $end: $start,
                            counter: $accumulator['counter']
                        })

                    case 18:

                        $step = 19

                    case 19:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]


                    case 20:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
