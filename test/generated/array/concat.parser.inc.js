module.exports = function ({ parsers, $lookup }) {
    parsers.inc.object = function () {
        return function (object, $step = 0, $i = [], $I = []) {
            let $_, $bite, $index = 0, $buffers = []

            return function $parse ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    object = {
                        nudge: 0,
                        array: [],
                        sentry: 0
                    }

                    $step = 1

                case 1:

                    $step = 2

                case 2:

                    if ($start == $end) {
                        return { start: $start, object: null, parse: $parse }
                    }

                    object.nudge = $buffer[$start++]


                case 3:

                    $step = 4

                case 4:

                    if ($start == $end) {
                        return { start: $start, object: null, parse: $parse }
                    }

                    $I[0] = $buffer[$start++]


                    $step = 5

                case 5:

                    const $length = Math.min($I[0] - $index, $end - $start)
                    $buffers.push($buffer.slice($start, $start + $length))
                    $index += $length
                    $start += $length

                    if ($index != $I[0]) {
                        return { start: $start, parse: $parse }
                    }

                    object.array = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                    $index = 0
                    $buffers = []

                    $step = 6

                case 6:

                    $step = 7

                case 7:

                    if ($start == $end) {
                        return { start: $start, object: null, parse: $parse }
                    }

                    object.sentry = $buffer[$start++]


                case 8:

                    return { start: $start, object: object, parse: null }
                }
            }
        }
    } ()
}
