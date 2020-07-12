module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $i = [], $I = []

            let object = {
                array: [],
                sentry: 0
            }

            $I[0] = ($buffer[$start++])

            object.array = $buffer.slice($start, $start + $I[0])
            $start += $I[0]

            if (($ => false)(object)){
                object.sentry =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
            } else if (($ => true)(object)){
                object.sentry = ($buffer[$start++])
            }

            return object
        }
    } ()
}
