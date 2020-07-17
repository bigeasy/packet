module.exports = function ({ parsers, $lookup }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                value: []
            }

            object.value = []

            return object
        }
    } ()
}
