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

            $_ = $slice.indexOf(Buffer.from([ 13, 10 ]))
            if (~$_) {
                $slice = $buffer.slice(0, $_)
            }

            object.array.push($slice)

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
