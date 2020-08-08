module.exports = function ({ $lookup }) {
    return {
        object: function () {
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

                            $bite = 3
                            $_ = object.counted.length

                        case 3:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 3
                                    ; (function ({ $start, $end, counter }) {
                                        counter[0] += $end - $start
                                    })({
                                        $start: $starts[0],
                                        $end: $start,
                                        counter: $accumulator['counter']
                                    })
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                        case 4:

                            $i[0] = 0
                            $step = 5

                        case 5:

                            $bite = 0
                            $_ = object.counted.string[$i[0]]

                        case 6:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 6
                                    ; (function ({ $start, $end, counter }) {
                                        counter[0] += $end - $start
                                    })({
                                        $start: $starts[0],
                                        $end: $start,
                                        counter: $accumulator['counter']
                                    })
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }
                            if (++$i[0] != object.counted.string.length) {
                                $step = 5
                                continue
                            }

                            $step = 7

                        case 7:

                            if ($start == $end) {
                                $step = 7
                                ; (function ({ $start, $end, counter }) {
                                    counter[0] += $end - $start
                                })({
                                    $start: $starts[0],
                                    $end: $start,
                                    counter: $accumulator['counter']
                                })
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x0

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

                            if ((({ $, counter }) => $.counted.length - counter[0] == 1)({
                                $: object,
                                counter: $accumulator['counter']
                            })) {
                                $step = 10
                                continue
                            } else if ((({ $, counter }) => $.counted.length - counter[0] == 2)({
                                $: object,
                                counter: $accumulator['counter']
                            })) {
                                $step = 12
                                continue
                            } else {
                                $step = 14
                                continue
                            }

                        case 10:

                            $bite = 0
                            $_ = object.counted.number

                        case 11:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 11
                                    ; (function ({ $start, $end, counter }) {
                                        counter[0] += $end - $start
                                    })({
                                        $start: $starts[0],
                                        $end: $start,
                                        counter: $accumulator['counter']
                                    })
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                            $step = 16
                            continue

                        case 12:

                            $bite = 1
                            $_ = object.counted.number

                        case 13:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 13
                                    ; (function ({ $start, $end, counter }) {
                                        counter[0] += $end - $start
                                    })({
                                        $start: $starts[0],
                                        $end: $start,
                                        counter: $accumulator['counter']
                                    })
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                            $step = 16
                            continue

                        case 14:

                            $bite = 3
                            $_ = object.counted.number

                        case 15:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 15
                                    ; (function ({ $start, $end, counter }) {
                                        counter[0] += $end - $start
                                    })({
                                        $start: $starts[0],
                                        $end: $start,
                                        counter: $accumulator['counter']
                                    })
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
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

                            $bite = 0
                            $_ = object.sentry

                        case 17:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 17
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                        }

                        break
                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
