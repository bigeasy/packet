module.exports = function ({ sizeOf }) {
    sizeOf.object = function () {


        return function (object) {
            let $start = 0, $starts = [], $accumulator = {}

            $accumulator['counter'] = [ 0 ]

            $starts[0] = $start

            $start += 4

            $start += 1 * object.counted.string.length + 1

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

                $start += 1

                break

            case 2:

                $start += 2

                break

            default:

                $start += 4

                break
            }

            ; (function ({ $start, $end, counter }) {
                counter[0] += $end - $start
            })({
                $start: $starts[0],
                $end: $start,
                counter: $accumulator['counter']
            })

            $start += 1

            return $start
        }
    } ()
}
