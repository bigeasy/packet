module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $_, $i = [], $I = [], $slice = null

            let object = {
                type: 0,
                value: null,
                sentry: 0
            }

            object.type = ($buffer[$start++])

            switch (String(($ => $.type)(object))) {
            case "0":
                object.value = {
                    value: 0
                }

                object.value.value = ($buffer[$start++])

                break

            case "1":
                object.value = []

                $I[0] = ($buffer[$start++])
                $i[0] = 0

                for (; $i[0] < $I[0]; $i[0]++) {
                    object.value[$i[0]] = ($buffer[$start++])
                }

                break

            case "2":
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

                break

            case "3":
                object.value = []

                $I[0] = ($buffer[$start++])

                object.value = $buffer.slice($start, $start + $I[0])
                $start += $I[0]

                break

            case "4":
                object.value = []

                $i[0] = 0
                do {
                    object.value[$i[0]] = ($buffer[$start++])
                } while (++$i[0] != 3)

                break

            default:
                $slice = $buffer.slice($start, $start + 3)
                $start += 3
                object.value = $slice

                break
            }

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
