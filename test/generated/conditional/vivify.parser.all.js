module.exports = function ({ parsers }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $_, $i = [], $I = [], $slice = null

            let object = {
                type: 0,
                value: null,
                sentry: 0
            }

            object.type = ($buffer[$start++])

            if (($ => $.type == 0)(object)) {
                object.value = {
                    value: 0
                }

                object.value.value = ($buffer[$start++])
            } else if (($ => $.type == 1)(object)) {
                object.value = []

                $I[0] = ($buffer[$start++])
                $i[0] = 0

                for (; $i[0] < $I[0]; $i[0]++) {
                    object.value[$i[0]] = ($buffer[$start++])
                }
            } else if (($ => $.type == 2)(object)) {
                object.value = []

                $i[0] = 0
                for (;;) {
                    if (
                        $buffer[$start] == 0x0
                    ) {
                        $start += 1
                        break
                    }

                    object.value[$i[0]] = ($buffer[$start++])

                    $i[0]++
                }
            } else if (($ => $.type == 3)(object)) {
                object.value = []

                $I[0] = ($buffer[$start++])

                object.value = $buffer.slice($start, $start + $I[0])
                $start += $I[0]
            } else if (($ => $.type == 4)(object)) {
                object.value = []

                $i[0] = 0
                for (;;) {
                    object.value[$i[0]] = ($buffer[$start++])
                    $i[0]++

                    if ($i[0] == 3) {
                        break
                    }
                }

            } else {
                $slice = $buffer.slice($start, $start + 3)
                $start += 3
                object.value = $slice
            }

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
