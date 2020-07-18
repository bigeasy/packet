module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $_, $i = []

            let object = {
                nudge: 0,
                array: null,
                sentry: 0
            }

            object.nudge = ($buffer[$start++])

            $_ = $buffer.indexOf(Buffer.from([ 10, 11, 10, 11 ]), $start)
            $_ = ~$_ ? $_ : $start
            object.array = $buffer.slice($start, $_)
            $start = $_ + 4

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
