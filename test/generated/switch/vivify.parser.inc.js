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

                            switch (String(($ => $.type)(object))) {
                            case "0":

                                object.value = {
                                    value: 0
                                }

                                $step = 4
                                continue

                            case "1":

                                object.value = []

                                $step = 6
                                continue

                            case "2":

                                object.value = []

                                $step = 11
                                continue

                            case "3":

                                object.value = []

                                $step = 17
                                continue

                            case "4":

                                object.value = []

                                $step = 20
                                continue

                            default:

                                $step = 24
                                continue
                            }

                        case 4:

                            $step = 5

                        case 5:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.value.value = $buffer[$start++]

                            $step = 26
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


                        case 9:

                            $step = 10

                        case 10:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.value[$i[0]] = $buffer[$start++]

                            if (++$i[0] != $I[0]) {
                                $step = 8
                                continue
                            }
                            $step = 26
                            continue

                        case 11:

                            $i[0] = 0

                        case 12:

                            $step = 12

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start] == 0x0) {
                                $start++
                                $step = 16
                                continue
                            }

                            $step = 13

                        case 13:

                            $step = 14

                        case 14:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.value[$i[0]] = $buffer[$start++]


                        case 15:

                            $i[0]++
                            $step = 12
                            continue

                        case 16:

                            // Here
                            $step = 16
                            $step = 26
                            continue

                        case 17:

                            $step = 18

                        case 18:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            $I[0] = $buffer[$start++]


                            $step = 19

                        case 19:

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

                            $step = 20
                            $step = 26
                            continue

                        case 20:

                            $i[0] = 0

                        case 21:

                            $step = 22

                        case 22:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.value[$i[0]] = $buffer[$start++]


                        case 23:

                            $i[0]++

                            if ($i[0] != 3) {
                                $step = 21
                                continue
                            }

                            $step = 24

                            $step = 26
                            continue

                        case 24:

                            $_ = 0

                            $step = 25

                        case 25: {

                            const length = Math.min($end - $start, 3 - $_)
                            $buffers.push($buffer.slice($start, $start + length))
                            $start += length
                            $_ += length

                            if ($_ != 3) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.value = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                            $buffers = []

                            $step = 26

                        }

                        case 26:

                            $step = 27

                        case 27:

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.sentry = $buffer[$start++]


                        case 28:

                            return { start: $start, object: object, parse: null }
                        }
                        break
                    }
                }
            }
        } ()
    }
}
