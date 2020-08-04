module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let object = {
                    value: null
                }

                object.value = null

                return object
            }
        } ()
    }
}
