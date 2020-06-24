module.exports = function ({ parsers }) {
    parsers.all.object = function ($buffer, $start) {
        const object = {
            value: {
                first: 0,
                second: 0
            },
            sentry: 0
        }

        object.value.first = ($buffer[$start++])

        object.value.second = ($buffer[$start++])

        object.sentry = ($buffer[$start++])

        return object
    }
}
