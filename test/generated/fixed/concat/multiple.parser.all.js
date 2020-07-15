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

            $_ = $slice.indexOf(Buffer.from([ 10, 11 ]))
            if (~$_) {
                $slice = $buffer.slice(0, $_)
            }

            object.array = $slice

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
