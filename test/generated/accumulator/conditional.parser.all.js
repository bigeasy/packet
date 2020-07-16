module.exports = function ({ parsers }) {
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

            object.counted.length =
                ($buffer[$start++]) * 0x1000000 +
                ($buffer[$start++]) * 0x10000 +
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])

            $i[0] = 0
            for (;;) {
                if (
                    $buffer[$start] == 0x0
                ) {
                    $start += 1
                    break
                }

                object.counted.string[$i[0]] = ($buffer[$start++])

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
                object.counted.number = ($buffer[$start++])
            } else if ((({ $, counter }) => $.counted.length - counter[0] == 2)({
                $: object,
                counter: $accumulator['counter']
            })) {
                object.counted.number =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
            } else {
                object.counted.number =
                    ($buffer[$start++]) * 0x1000000 +
                    ($buffer[$start++]) * 0x10000 +
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
            }

            ; (function ({ $start, $end, counter }) {
                counter[0] += $end - $start
            })({
                $start: $starts[0],
                $end: $start,
                counter: $accumulator['counter']
            })

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
