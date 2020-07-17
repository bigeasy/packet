module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                value: 0,
                sentry: 0
            }

            object.value = ($buffer[$start++])

            ; (($_ = 0) => require('assert').equal($_, 1))(object.value)

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
