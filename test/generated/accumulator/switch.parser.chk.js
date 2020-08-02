module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
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

                object.counted.length = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

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

                    object.counted.string[$i[0]] = (
                        $buffer[$start++]
                    ) >>> 0

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

                switch ((({ $, counter }) => $.counted.length - counter[0])({
                    $: object,
                    counter: $accumulator['counter']
                })) {
                case 1:
                    if ($end - $start < 1) {
                        return parsers.inc.object(object, 12, $i, $accumulator, $starts)($buffer, $start, $end)
                    }

                    object.counted.number = (
                        $buffer[$start++]
                    ) >>> 0

                    break

                case 2:
                    if ($end - $start < 2) {
                        return parsers.inc.object(object, 14, $i, $accumulator, $starts)($buffer, $start, $end)
                    }

                    object.counted.number = (
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0

                    break

                default:
                    if ($end - $start < 4) {
                        return parsers.inc.object(object, 16, $i, $accumulator, $starts)($buffer, $start, $end)
                    }

                    object.counted.number = (
                        $buffer[$start++] << 24 |
                        $buffer[$start++] << 16 |
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0

                    break
                }

                ; (function ({ $start, $end, counter }) {
                    counter[0] += $end - $start
                })({
                    $start: $starts[0],
                    $end: $start,
                    counter: $accumulator['counter']
                })

                if ($end - $start < 1) {
                    return parsers.inc.object(object, 18, $i, $accumulator, $starts)($buffer, $start, $end)
                }

                object.sentry = (
                    $buffer[$start++]
                ) >>> 0

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
