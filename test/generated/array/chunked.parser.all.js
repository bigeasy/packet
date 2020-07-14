module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $i = [], $I = []

            let object = {
                array: [],
                sentry: 0
            }

            $I[0] = ($buffer[$start++])

            object.array = [ $buffer.slice($start, $start + $I[0]) ]
            $start += $I[0]

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
