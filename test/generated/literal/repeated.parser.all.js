module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                nudge: 0,
                padded: 0,
                sentry: 0
            }

            object.nudge = (
                $buffer[$start++]
            ) >>> 0

            $start += 6

            object.padded = (
                $buffer[$start++] << 8 |
                $buffer[$start++]
            ) >>> 0

            $start += 6

            object.sentry = (
                $buffer[$start++]
            ) >>> 0

            return object
        }
    } ()
}
