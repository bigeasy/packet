module.exports = function ({ parsers }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                padded: 0,
                sentry: 0
            }

            $start += 6

            object.padded =
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])

            $start += 6

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
