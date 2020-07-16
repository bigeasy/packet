module.exports = function ({ parsers }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                value: 0,
                sentry: 0
            }

            object.value =
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])

            object.value = (value => value)(object.value)

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
