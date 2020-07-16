module.exports = function ({ parsers }) {
    parsers.bff.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
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

                if ($end - $start < 4) {
                    return parsers.inc.object(object, 3, $i, $accumulator, $starts)($buffer, $start, $end)
                }

                object.counted.length =
                    ($buffer[$start++]) * 0x1000000 +
                    ($buffer[$start++]) * 0x10000 +
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])

                $i[0] = 0
                for (;;) {
                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 6, $i, $accumulator, $starts)($buffer, $start, $end)
                    }

                    if (
                        $buffer[$start] == 0x0
                    ) {
                        $start += 1
                        break
                    }

                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 8, $i, $accumulator, $starts)($buffer, $start, $end)
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
                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 13, $i, $accumulator, $starts)($buffer, $start, $end)
                    }

                    object.counted.number = ($buffer[$start++])
                } else if ((({ $, counter }) => $.counted.length - counter[0] == 2)({
                    $: object,
                    counter: $accumulator['counter']
                })) {
                    if ($end - $start < 2) {
                        return parsers.inc.object(object, 15, $i, $accumulator, $starts)($buffer, $start, $end)
                    }

                    object.counted.number =
                        ($buffer[$start++]) * 0x100 +
                        ($buffer[$start++])
                } else {
                    if ($end - $start < 4) {
                        return parsers.inc.object(object, 17, $i, $accumulator, $starts)($buffer, $start, $end)
                    }

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

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 19, $i, $accumulator, $starts)($buffer, $start, $end)
                }

                object.sentry = ($buffer[$start++])

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
