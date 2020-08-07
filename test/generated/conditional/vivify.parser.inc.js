module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = [], $I = []) {
                let $_, $bite, $length = 0, $index = 0, $buffers = []

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                type: 0,
                                value: null,
                                sentry: 0
                            }

                            $step = 1

                        case 1:

                            $step = 2

                        case 2:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.type = $buffer[$start++]



                        case 3:

                            if (($ => $.type == 0)(object)) {
                                object.value = {
                                    value: 0
                                }

                                $step = 4
                                continue
                            } else if (($ => $.type == 1)(object)) {
                                object.value = []

                                $step = 6
                                continue
                            } else if (($ => $.type == 2)(object)) {
                                object.value = []

                                $step = 10
                                continue
                            } else if (($ => $.type == 3)(object)) {
                                object.value = []

                                $step = 16
                                continue
                            } else if (($ => $.type == 4)(object)) {
                                object.value = []

                                $step = 19
                                continue
                            } else {
                                $step = 23
                                continue
                            }

                        case 4:

                            $step = 5

                        case 5:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.value.value = $buffer[$start++]


                            $step = 25
                            continue

                        case 6:

                            $step = 7

                        case 7:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            $I[0] = $buffer[$start++]

                            $i[0] = 0
                        case 8:

                            $step = 9

                        case 9:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.value[$i[0]] = $buffer[$start++]

                            if (++$i[0] != $I[0]) {
                                $step = 8
                                continue
                            }

                            $step = 25
                            continue

                        case 10:

                            $i[0] = 0

                        case 11:

                            $step = 11

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start] == 0x0) {
                                $start++
                                $step = 15
                                continue
                            }

                            $step = 12

                        case 12:

                            $step = 13

                        case 13:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.value[$i[0]] = $buffer[$start++]


                        case 14:

                            $i[0]++
                            $step = 11
                            continue

                        case 15:

                            // Here
                            $step = 15

                            $step = 25
                            continue

                        case 16:

                            $step = 17

                        case 17:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            $I[0] = $buffer[$start++]


                            $step = 18

                        case 18:

                            const $length = Math.min($I[0] - $index, $end - $start)
                            $buffers.push($buffer.slice($start, $start + $length))
                            $index += $length
                            $start += $length

                            if ($index != $I[0]) {
                                return { start: $start, parse: $parse }
                            }

                            object.value = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                            $index = 0
                            $buffers = []

                            $step = 19

                            $step = 25
                            continue

                        case 19:

                            $i[0] = 0

                        case 20:

                            $step = 21

                        case 21:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.value[$i[0]] = $buffer[$start++]


                        case 22:

                            $i[0]++

                            if ($i[0] != 3) {
                                $step = 20
                                continue
                            }

                            $step = 23


                            $step = 25
                            continue

                        case 23:

                            $_ = 0

                            $step = 24

                        case 24: {

                            const length = Math.min($end - $start, 3 - $_)
                            $buffers.push($buffer.slice($start, $start + length))
                            $start += length
                            $_ += length

                            if ($_ != 3) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.value = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                            $buffers = []

                            $step = 25

                        }


                        case 25:

                            $step = 26

                        case 26:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.sentry = $buffer[$start++]


                        case 27:

                            return { start: $start, object: object, parse: null }
                        }
                        break
                    }
                }
            }
        } ()
    }
}
