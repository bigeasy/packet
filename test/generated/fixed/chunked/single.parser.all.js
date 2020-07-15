module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            let $_, $i = [], $slice = null

            let object = {
                nudge: 0,
                array: [],
                sentry: 0
            }

            object.nudge = ($buffer[$start++])

            $slice = $buffer.slice($start, $start + 8)
            $start += 8

            $_ = $slice.indexOf(0)
            if (~$_) {
                $slice = $slice.slice(0, $_)
            }

            object.array.push($slice)

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
