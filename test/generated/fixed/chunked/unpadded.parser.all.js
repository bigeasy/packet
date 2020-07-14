module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $_, $i = [], $slice = null

            let object = {
                array: [],
                sentry: 0
            }

            $slice = $buffer.slice($start, 8)
            $start += 8
            object.array.push($slice)

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
