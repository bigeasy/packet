module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let object = {
                    value: null
                }

                object.value = null

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
