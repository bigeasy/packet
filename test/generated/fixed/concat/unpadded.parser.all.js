module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $_, $i = [], $slice = null

            let object = {
                array: null,
                sentry: 0
            }

            $slice = $buffer.slice($start, 8)
            $start += 8
            object.array = $slice

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
