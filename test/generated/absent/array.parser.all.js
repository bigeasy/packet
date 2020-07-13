module.exports = function ({ parsers }) {
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
