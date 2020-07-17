module.exports = function ({ serializers, $lookup }) {
    serializers.inc.object = function () {
        return function (object, $step = 0, $i = [], $accumulator = {}, $starts = []) {
            let $_, $bite, $restart = false

            return function $serialize ($buffer, $start, $end) {
                if ($restart) {
                    for (let $j = 0; $j < $starts.length; $j++) {
                        $starts[$j] = $start
                    }
                }
                $restart = true

                for (;;) {
                    switch ($step) {
                    case 0:

                        $accumulator['counter'] = [ 0 ]

                    case 1:

                        $starts[0] = $start

                    case 2:

                        $step = 3
                        $bite = 3
                        $_ = object.counted.length

                    case 3:

                        while ($bite != -1) {
                            if ($start == $end) {
                                ; (function ({ $start, $end, counter }) {
                                    counter[0] += $end - $start
                                })({
                                    $start: $starts[0],
                                    $end: $start,
                                    counter: $accumulator['counter']
                                })
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                    case 4:

                        $i[0] = 0
                        $step = 5

                    case 5:

                        $step = 6
                        $bite = 0
                        $_ = object.counted.string[$i[0]]

                    case 6:

                        while ($bite != -1) {
                            if ($start == $end) {
                                ; (function ({ $start, $end, counter }) {
                                    counter[0] += $end - $start
                                })({
                                    $start: $starts[0],
                                    $end: $start,
                                    counter: $accumulator['counter']
                                })
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        if (++$i[0] != object.counted.string.length) {
                            $step = 5
                            continue
                        }

                        $step = 7

                    case 7:

                        if ($start == $end) {
                            ; (function ({ $start, $end, counter }) {
                                counter[0] += $end - $start
                            })({
                                $start: $starts[0],
                                $end: $start,
                                counter: $accumulator['counter']
                            })
                            $starts[0] = $start
                            return { start: $start, serialize: $serialize }
                        }

                        $buffer[$start++] = 0x0

                        $step = 8

                    case 8:

                    case 9:

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

                            $step = 10
                            continue

                        case 2:

                            $step = 12
                            continue

                        default:

                            $step = 14
                            continue
                        }

                    case 10:

                        $step = 11
                        $bite = 0
                        $_ = object.counted.number

                    case 11:

                        while ($bite != -1) {
                            if ($start == $end) {
                                ; (function ({ $start, $end, counter }) {
                                    counter[0] += $end - $start
                                })({
                                    $start: $starts[0],
                                    $end: $start,
                                    counter: $accumulator['counter']
                                })
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        $step = 16
                        continue

                    case 12:

                        $step = 13
                        $bite = 1
                        $_ = object.counted.number

                    case 13:

                        while ($bite != -1) {
                            if ($start == $end) {
                                ; (function ({ $start, $end, counter }) {
                                    counter[0] += $end - $start
                                })({
                                    $start: $starts[0],
                                    $end: $start,
                                    counter: $accumulator['counter']
                                })
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        $step = 16
                        continue

                    case 14:

                        $step = 15
                        $bite = 3
                        $_ = object.counted.number

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
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                        ; (function ({ $start, $end, counter }) {
                            counter[0] += $end - $start
                        })({
                            $start: $starts[0],
                            $end: $start,
                            counter: $accumulator['counter']
                        })

                    case 16:

                        $step = 17
                        $bite = 0
                        $_ = object.sentry

                    case 17:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                        $step = 18

                    case 18:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
