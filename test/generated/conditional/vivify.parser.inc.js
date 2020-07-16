module.exports = function ({ parsers }) {
    parsers.inc.object = function () {
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

                            $step = 11
                            continue
                        } else if (($ => $.type == 3)(object)) {
                            object.value = []

                            $step = 18
                            continue
                        } else if (($ => $.type == 4)(object)) {
                            object.value = []

                            $step = 21
                            continue
                        } else {
                            $step = 26
                            continue
                        }

                    case 4:

                        $step = 5

                    case 5:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.value.value = $buffer[$start++]


                        $step = 28
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

                        $step = 28
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
                            $step = 17
                            continue
                        }

                        $step = 13

                    case 13:


                    case 14:

                        $step = 15

                    case 15:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.value[$i[0]] = $buffer[$start++]


                    case 16:

                        $i[0]++
                        $step = 12
                        continue

                    case 17:

                        // Here
                        $step = 17

                        $step = 28
                        continue

                    case 18:

                        $step = 19

                    case 19:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        $I[0] = $buffer[$start++]


                        $step = 20

                    case 20:

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

                        $step = 21

                        $step = 28
                        continue

                    case 21:

                        $i[0] = 0

                    case 22:

                    case 23:

                        $step = 24

                    case 24:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.value[$i[0]] = $buffer[$start++]


                    case 25:

                        $i[0]++

                        if ($i[0] != 3) {
                            $step = 23
                            continue
                        }

                        $_ = (3 - $i[0]) * 1 - 0
                        $step = 26


                        $step = 28
                        continue

                    case 26:

                        $_ = 0

                        $step = 27

                    case 27: {

                        const length = Math.min($end - $start, 3 - $_)
                        $buffers.push($buffer.slice($start, $start + length))
                        $start += length
                        $_ += length

                        if ($_ != 3) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.value = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                        $buffers = []

                        $step = 28

                    }


                    case 28:

                        $step = 29

                    case 29:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]


                    case 30:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
