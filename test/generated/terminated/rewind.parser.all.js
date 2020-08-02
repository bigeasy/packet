module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let $_, $i = []

            let object = {
                nudge: 0,
                array: null,
                sentry: 0
            }

            object.nudge = (
                $buffer[$start++]
            ) >>> 0

            $_ = $buffer.indexOf(Buffer.from([ 97, 98, 99, 97, 98, 100 ]), $start)
            $_ = ~$_ ? $_ : $start
            object.array = $buffer.slice($start, $_)
            $start = $_ + 6

            object.sentry = (
                $buffer[$start++]
            ) >>> 0

            return object
        }
    } ()
}
