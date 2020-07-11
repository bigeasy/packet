module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $_, $i = [], $slice = null

            let object = {
                array: Buffer.alloc(8),
                sentry: []
            }

            $slice = $buffer.slice($start, 8)
            $start += 8
            object.array = $slice

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
