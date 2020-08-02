module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $_, $i = [], $I = [], $slice = null

            let object = {
                nudge: 0,
                array: null,
                sentry: 0
            }

            object.nudge = (
                $buffer[$start++]
            ) >>> 0

            $I[0] = (() => 8)()

            $slice = $buffer.slice($start, $start + $I[0])
            $start += $I[0]
            object.array = [ $slice ]

            object.sentry = (
                $buffer[$start++]
            ) >>> 0

            return object
        }
    } ()
}
