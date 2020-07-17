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
                            $_ += ($buffer[$start++]) << $bite * 8 >>> 0
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
                            $step = 11
                            continue
                        }

                        $step = 7

                    case 7:


                    case 8:

                        $step = 9

                    case 9:

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


                    case 10:

                        $i[0]++
                        $step = 6
                        continue

                    case 11:

                        // Here
                        $step = 11


                    case 12:

                        ; (function ({ $start, $end, counter }) {
                            counter[0] += $end - $start
                        })({
                            $start: $starts[0],
                            $end: $start,
                            counter: $accumulator['counter']
                        })
                        $starts[0] = $start

                        if ((({ $, counter }) => $.counted.length - counter[0] == 1)({
                            $: object,
                            counter: $accumulator['counter']
                        })) {
                            $step = 13
                            continue
                        } else if ((({ $, counter }) => $.counted.length - counter[0] == 2)({
                            $: object,
                            counter: $accumulator['counter']
                        })) {
                            $step = 15
                            continue
                        } else {
                            $step = 17
                            continue
                        }

                    case 13:

                        $step = 14

                    case 14:

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


                        $step = 19
                        continue

                    case 15:

                        $_ = 0
                        $step = 16
                        $bite = 1

                    case 16:

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
                            $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                            $bite--
                        }

                        object.counted.number = $_


                        $step = 19
                        continue

                    case 17:

                        $_ = 0
                        $step = 18
                        $bite = 3

                    case 18:

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
                            $_ += ($buffer[$start++]) << $bite * 8 >>> 0
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

                    case 19:

                        $step = 20

                    case 20:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]


                    case 21:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
