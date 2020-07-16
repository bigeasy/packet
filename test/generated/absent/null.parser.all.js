module.exports = function ({ parsers }) {
    parsers.all.object = function () {
        return function ($buffer, $start) {
            let object = {
                value: null
            }

            object.value = null

            return object
        }
    } ()
}
