module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        return function ($buffer, $start) {
            const object = {
                value: 0,
                sentry: 0
            }

            object.value =
                ($buffer[$start++]) * 0x1000000 +
                ($buffer[$start++]) * 0x10000 +
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++])

            object.value = (value => ~value)(object.value)

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
