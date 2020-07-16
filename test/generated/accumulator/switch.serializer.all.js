module.exports = function ({ serializers }) {
    serializers.all.object = function () {
        return function (object) {
            return function ($buffer, $start, $end) {
                let $i = [], $accumulator = {}, $starts = []

                $accumulator['counter'] = [ 0 ]

                $starts[0] = $start

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

                    $buffer[$start++] = (object.counted.number & 0xff)

                    break

                case 2:

                    $buffer[$start++] = (object.counted.number >>> 8 & 0xff)
                    $buffer[$start++] = (object.counted.number & 0xff)

                    break

                default:

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

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
