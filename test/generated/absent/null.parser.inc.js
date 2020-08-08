module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
                            value: null
                        }

                    case 1:

                        object.value = null

                    }

                    return { start: $start, object: object, parse: null }
                }
            }
        } ()
    }
}
