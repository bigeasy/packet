module.exports = function ({ parsers }) {
    parsers.all.object = function () {


        const $lookup = {
            "object": {
                "value": [
                    "off",
                    "on"
                ]
            }
        }

        return function ($buffer, $start) {
            let $_

            const object = {
                value: 0,
                sentry: 0
            }

            $_ = ($buffer[$start++])

            object.value = $lookup.object.value[$_]

            object.sentry = ($buffer[$start++])

            return object
        }
    } ()
}
