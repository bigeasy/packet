module.exports = function ({ parsers }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $i = [], $I = []

            let object = {
                nudge: 0,
                array: [],
                sentry: 0
            }

            object.nudge = ($buffer[$start++])

            $I[0] = ($buffer[$start++])

            object.array = [ $buffer.slice($start, $start + $I[0]) ]
            $start += $I[0]

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
