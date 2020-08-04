module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let object = {
                    value: []
                }

                object.value = []

                return object
            }
        } ()
    }
}
