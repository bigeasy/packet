module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $_, $i = [], $slice = null

                let object = {
                    nudge: 0,
                    array: null,
                    sentry: 0
                }

                object.nudge = $buffer[$start++]

                $slice = $buffer.slice($start, $start + 8)
                $start += 8

                $_ = $slice.indexOf(Buffer.from([ 13, 10 ]))
                if (~$_) {
                    $slice = $slice.slice(0, $_)
                }

                object.array = [ $slice ]

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
