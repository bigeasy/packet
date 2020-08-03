module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                nudge: 0,
                padded: 0,
                sentry: 0
            }

            object.nudge = $buffer[$start++]

            $start += 3

            object.padded = (
                $buffer[$start++] << 8 |
                $buffer[$start++]
            ) >>> 0

            $start += 3

            object.sentry = $buffer[$start++]

            return object
        }
    } ()
}
