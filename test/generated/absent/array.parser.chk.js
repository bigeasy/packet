module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
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
}
