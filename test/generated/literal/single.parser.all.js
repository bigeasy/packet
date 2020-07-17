module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                padded: 0,
                sentry: 0
            }

            $start += 3

            object.padded =
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])

            $start += 3

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
