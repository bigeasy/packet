module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $i = [], $I = []

            let object = {
                type: 0,
                array: [],
                sentry: 0
            }

            object.type = ($buffer[$start++])

            $I[0] = ($buffer[$start++])

            object.array = $buffer.slice($start, $start + $I[0])
            $start += $I[0]

            if (($ => $.type == 0)(object)){
                object.sentry = ($buffer[$start++])
            } else if (($ => true)(object)){
                object.sentry =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
            }

            return object
        }
    } ()
}
