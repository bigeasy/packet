module.exports = function ({ parsers, $lookup }) {
    parsers.chk.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let object = {
                    value: []
                }

                object.value = []

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
