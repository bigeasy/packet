module.exports = {
    object: function () {
        return function (object) {
            let $start = 0, $starts = [], $accumulator = {}, $$ = []

            $accumulator['counter'] = [ 0 ]

            $starts[0] = $start

            $start += 4

            $start += 1 * object.string.length + 1

            ; (function ({ $start, $end, counter }) {
                counter[0] += $end - $start
            })({
                $start: $starts[0],
                $end: $start,
                counter: $accumulator['counter']
            })
            $starts[0] = $start

            if ((({ $, counter }) => $.length - counter[0] == 1)({
                $: object,
                counter: $accumulator['counter']
            })) {
                $start += 1
            } else if ((({ $, counter }) => $.length - counter[0] == 2)({
                $: object,
                counter: $accumulator['counter']
            })) {
                $start += 2
            } else {
                $start += 4
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
