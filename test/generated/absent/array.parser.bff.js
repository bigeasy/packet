module.exports = function ({ parsers }) {
    parsers.bff.object = function () {


        return function () {
            return function parse ($buffer, $start, $end) {
                let object = {
                    value: []
                }

                object.value = []

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
