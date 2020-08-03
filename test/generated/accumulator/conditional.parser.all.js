module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $i = [], $accumulator = {}, $starts = []

            let object = {
                counted: {
                    length: 0,
                    string: [],
                    number: 0
                },
                sentry: 0
            }

            $accumulator['counter'] = [ 0 ]

            $starts[0] = $start

            object.counted.length = (
                $buffer[$start++] << 24 |
                $buffer[$start++] << 16 |
                $buffer[$start++] << 8 |
                $buffer[$start++]
            ) >>> 0

            $i[0] = 0
            for (;;) {
                if (
                    $buffer[$start] == 0x0
                ) {
                    $start += 1
                    break
                }

                object.counted.string[$i[0]] = $buffer[$start++]

                $i[0]++
            }

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
                object.counted.number = $buffer[$start++]
            } else if ((({ $, counter }) => $.counted.length - counter[0] == 2)({
                $: object,
                counter: $accumulator['counter']
            })) {
                object.counted.number = (
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0
            } else {
                object.counted.number = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0
            }

            ; (function ({ $start, $end, counter }) {
                counter[0] += $end - $start
            })({
                $start: $starts[0],
                $end: $start,
                counter: $accumulator['counter']
            })

            object.sentry = $buffer[$start++]

            return object
        }
    } ()
}
