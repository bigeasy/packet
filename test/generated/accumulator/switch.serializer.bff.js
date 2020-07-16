module.exports = function ({ serializers }) {
    serializers.bff.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = [], $accumulator = {}, $starts = []

                $accumulator['counter'] = [ 0 ]

                $starts[0] = $start

                if ($end - $start < 5 + object.counted.string.length * 1) {
                    return serializers.inc.object(object, 2, $i, $accumulator, $starts)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.counted.length >>> 24 & 0xff)
                $buffer[$start++] = (object.counted.length >>> 16 & 0xff)
                $buffer[$start++] = (object.counted.length >>> 8 & 0xff)
                $buffer[$start++] = (object.counted.length & 0xff)

                for ($i[0] = 0; $i[0] < object.counted.string.length; $i[0]++) {
                    $buffer[$start++] = (object.counted.string[$i[0]] & 0xff)
                }

                $buffer[$start++] = 0x0

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
                        return serializers.inc.object(object, 10, $i, $accumulator, $starts)($buffer, $start, $end)
                    }

                    $buffer[$start++] = (object.counted.number & 0xff)

                    break

                case 2:

                    if ($end - $start < 2) {
                        return serializers.inc.object(object, 12, $i, $accumulator, $starts)($buffer, $start, $end)
                    }

                    $buffer[$start++] = (object.counted.number >>> 8 & 0xff)
                    $buffer[$start++] = (object.counted.number & 0xff)

                    break

                default:

                    if ($end - $start < 4) {
                        return serializers.inc.object(object, 14, $i, $accumulator, $starts)($buffer, $start, $end)
                    }

                    $buffer[$start++] = (object.counted.number >>> 24 & 0xff)
                    $buffer[$start++] = (object.counted.number >>> 16 & 0xff)
                    $buffer[$start++] = (object.counted.number >>> 8 & 0xff)
                    $buffer[$start++] = (object.counted.number & 0xff)

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
                    return serializers.inc.object(object, 16, $i, $accumulator, $starts)($buffer, $start, $end)
                }

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
