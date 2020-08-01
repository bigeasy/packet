module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                nudge: 0,
                padded: 0,
                sentry: 0
            }

            object.nudge = $buffer[$start++]

            $start += 6

            object.padded =
                $buffer[$start++] * 0x100 +
                $buffer[$start++]

            $start += 6

            object.sentry = $buffer[$start++]

            return object
        }
    } ()
}
