module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $_, $i = [], $slice = null

            let object = {
                array: [],
                sentry: []
            }

            $slice = $buffer.slice($start, 8)
            $start += 8
            object.array.push($slice)

            $i[0] = 0
            for (;;) {
                if (
                    $buffer[$start] == 0x0
                ) {
                    $start += 1
                    break
                }

                object.sentry[$i[0]] = ($buffer[$start++])

                $i[0]++
            }

            return object
        }
    } ()
}
