module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let object = {
                    value: null
                }

                switch (($ => 0)(object)) {
                case 0:
                    object.value = null

                    break

                case undefined:
                    object.value = null

                    break
                }

                return object
            }
        } ()
    }
}
