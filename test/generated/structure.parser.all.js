module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                value: {
                    first: 0,
                    second: 0
                },
                sentry: 0
            }

            object.value.first = (
                $buffer[$start++]
            ) >>> 0

            object.value.second = (
                $buffer[$start++]
            ) >>> 0

            object.sentry = (
                $buffer[$start++]
            ) >>> 0

            return object
        }
    } ()
}
